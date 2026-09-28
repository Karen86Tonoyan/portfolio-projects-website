/**
 * Split-token access model (browser-local demo using Web Crypto).
 * - Token = clientHalf || oracleHalf. Client keeps its half; Oracle keeps the other half under an opaque id.
 * - Cerber stores only a SHA-256 commitment of the full token and salted PBKDF2 hashes of two passwords.
 * - Oracle never returns its half: it only returns SHA-256(clientHalf || oracleHalf) for Cerber to compare.
 */
export type Decision = 'PASS' | 'DENY';
export type DenyReason = 'UNKNOWN' | 'REVOKED' | 'EXPIRED' | 'LOCKED' | 'BAD_PASSWORD' | 'BAD_HALF';

export interface LockoutConfig { threshold: number; baseDelayMs: number; maxDelayMs: number }
export const DEFAULT_LOCKOUT: LockoutConfig = { threshold: 3, baseDelayMs: 2000, maxDelayMs: 60_000 };

export interface VaultEvent { type: 'ISSUED' | 'ROTATED' | 'REVOKED' | 'PASS' | 'DENY' | 'LOCKOUT'; clientId: string; detail: string }

interface CerberRecord { commitment: string; salt: Uint8Array<ArrayBuffer>; pass1: string; pass2: string; expiresAt: number; revoked: boolean; failures: number; lockedUntil: number }

const PBKDF2_ITER = 100_000;
const HALF_BYTES = 16;

const rand = (n: number) => crypto.getRandomValues(new Uint8Array(new ArrayBuffer(n)));
const hex = (b: ArrayBuffer | Uint8Array) => Array.from(new Uint8Array(b), (x) => x.toString(16).padStart(2, '0')).join('');
const unhex = (s: string) => {
  if (!/^[0-9a-f]*$/i.test(s) || s.length % 2) return null;
  const out = new Uint8Array(new ArrayBuffer(s.length / 2));
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(s.slice(i * 2, i * 2 + 2), 16);
  return out;
};
const sha256 = async (parts: Uint8Array[]) => {
  const total = new Uint8Array(new ArrayBuffer(parts.reduce((n, p) => n + p.length, 0)));
  let o = 0; for (const p of parts) { total.set(p, o); o += p.length; }
  return hex(await crypto.subtle.digest('SHA-256', total));
};
const hashPass = async (pass: string, salt: Uint8Array<ArrayBuffer>, label: string) => {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`${label}:${pass}`), 'PBKDF2', false, ['deriveBits']);
  return hex(await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' }, key, 256));
};
/** Constant-time-ish comparison of equal-length hex strings. */
const safeEqual = (a: string, b: string) => { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i += 1) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

/** Oracle side: holds halves by opaque id and never exposes them or the client's identity. */
class OracleStore {
  #halves = new Map<string, Uint8Array>();
  put(id: string, half: Uint8Array) { this.#halves.set(id, half); }
  drop(id: string) { this.#halves.delete(id); }
  async combine(id: string, clientHalf: Uint8Array) { const h = this.#halves.get(id); return h ? sha256([clientHalf, h]) : null; }
  get size() { return this.#halves.size; }
}

export class TokenVault {
  #oracle = new OracleStore();
  #cerber = new Map<string, CerberRecord>();
  constructor(private ttlMs: number, public lockout: LockoutConfig = DEFAULT_LOCKOUT, private now: () => number = Date.now, private onEvent: (e: VaultEvent) => void = () => {}) {}

  get oracleHalfCount() { return this.#oracle.size; }

  async #mint(clientId: string) {
    const clientHalf = rand(HALF_BYTES);
    const oracleHalf = rand(HALF_BYTES);
    this.#oracle.put(clientId, oracleHalf);
    return { clientHalf, commitment: await sha256([clientHalf, oracleHalf]) };
  }

  /** Registers a client. Returns the opaque id and the client's half (shown once). */
  async issue(pass1: string, pass2: string) {
    if (pass1.length < 8 || pass2.length < 8) throw new Error('Każde hasło musi mieć co najmniej 8 znaków.');
    if (pass1 === pass2) throw new Error('Hasła muszą się różnić.');
    const clientId = `C-${hex(rand(4)).toUpperCase()}`;
    const salt = rand(16);
    const { clientHalf, commitment } = await this.#mint(clientId);
    this.#cerber.set(clientId, { commitment, salt, pass1: await hashPass(pass1, salt, 'p1'), pass2: await hashPass(pass2, salt, 'p2'), expiresAt: this.now() + this.ttlMs, revoked: false, failures: 0, lockedUntil: 0 });
    this.onEvent({ type: 'ISSUED', clientId, detail: 'Wydano parę połówek tokenu.' });
    return { clientId, clientHalf: hex(clientHalf) };
  }

  /** Invalidates the old pair immediately and returns a fresh client half. */
  async rotate(clientId: string) {
    const rec = this.#cerber.get(clientId);
    if (!rec || rec.revoked) throw new Error('Nie można rotować: brak aktywnego tokenu.');
    const { clientHalf, commitment } = await this.#mint(clientId);
    Object.assign(rec, { commitment, expiresAt: this.now() + this.ttlMs, failures: 0, lockedUntil: 0 });
    this.onEvent({ type: 'ROTATED', clientId, detail: 'Stara para unieważniona, wydano nową.' });
    return hex(clientHalf);
  }

  revoke(clientId: string) {
    const rec = this.#cerber.get(clientId);
    if (!rec) return;
    rec.revoked = true;
    this.#oracle.drop(clientId);
    this.onEvent({ type: 'REVOKED', clientId, detail: 'Token natychmiast unieważniony.' });
  }

  status(clientId: string) {
    const rec = this.#cerber.get(clientId);
    if (!rec) return null;
    return { revoked: rec.revoked, expiresAt: rec.expiresAt, expired: this.now() >= rec.expiresAt, failures: rec.failures, lockedUntil: rec.lockedUntil };
  }

  /** Cerber decision. All checks run; reason is reported for audit only. */
  async verify(clientId: string, pass1: string, pass2: string, clientHalfHex: string): Promise<{ decision: Decision; reason?: DenyReason; retryInMs?: number }> {
    const deny = (reason: DenyReason, retryInMs?: number) => {
      this.onEvent({ type: 'DENY', clientId, detail: `DENY: ${reason}` });
      return { decision: 'DENY' as const, reason, retryInMs };
    };
    const rec = this.#cerber.get(clientId);
    if (!rec) return deny('UNKNOWN');
    if (rec.revoked) return deny('REVOKED');
    const t = this.now();
    if (t < rec.lockedUntil) return deny('LOCKED', rec.lockedUntil - t);
    if (t >= rec.expiresAt) return deny('EXPIRED');

    const [h1, h2] = await Promise.all([hashPass(pass1, rec.salt, 'p1'), hashPass(pass2, rec.salt, 'p2')]);
    const half = unhex(clientHalfHex.trim());
    const combined = half && half.length === HALF_BYTES ? await this.#oracle.combine(clientId, half) : null;
    const passOk = safeEqual(h1, rec.pass1) && safeEqual(h2, rec.pass2);
    const halfOk = combined !== null && safeEqual(combined, rec.commitment);

    if (passOk && halfOk) {
      rec.failures = 0;
      this.onEvent({ type: 'PASS', clientId, detail: 'PASS: hasła i połówki tokenu zgodne.' });
      return { decision: 'PASS' };
    }
    rec.failures += 1;
    if (rec.failures >= this.lockout.threshold) {
      const delay = Math.min(this.lockout.maxDelayMs, this.lockout.baseDelayMs * 2 ** (rec.failures - this.lockout.threshold));
      rec.lockedUntil = t + delay;
      this.onEvent({ type: 'LOCKOUT', clientId, detail: `Blokada na ${Math.round(delay / 1000)} s po ${rec.failures} nieudanych próbach.` });
    }
    return deny(passOk ? 'BAD_HALF' : 'BAD_PASSWORD');
  }
}
