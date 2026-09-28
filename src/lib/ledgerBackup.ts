import { verifyChain, type LedgerEntry } from '@/lib/decisionLedger';

/** Encrypted ledger backups: PBKDF2-SHA256 (210k) + AES-256-GCM via Web Crypto. Runs only in the browser. */
const ITERATIONS = 210_000;
export const MIN_PASSPHRASE = 12;

interface BackupFile { v: 1; alg: 'AES-GCM'; kdf: 'PBKDF2-SHA256'; iter: number; salt: string; iv: string; data: string }

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) => { const raw = atob(s); const out = new Uint8Array(new ArrayBuffer(raw.length)); for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i); return out; };

const deriveKey = async (passphrase: string, salt: Uint8Array<ArrayBuffer>, iter: number) => {
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};

export const encryptLedger = async (ledger: readonly LedgerEntry[], passphrase: string): Promise<string> => {
  if (passphrase.length < MIN_PASSPHRASE) throw new Error(`Hasło musi mieć co najmniej ${MIN_PASSPHRASE} znaków.`);
  if (!verifyChain(ledger)) throw new Error('Dziennik ma naruszony łańcuch — kopia odrzucona.');
  const salt = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(16)));
  const iv = crypto.getRandomValues(new Uint8Array(new ArrayBuffer(12)));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const data = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(ledger)));
  const file: BackupFile = { v: 1, alg: 'AES-GCM', kdf: 'PBKDF2-SHA256', iter: ITERATIONS, salt: b64(salt), iv: b64(iv), data: b64(data) };
  return JSON.stringify(file);
};

const isEntry = (e: unknown): e is LedgerEntry => {
  const x = e as Record<string, unknown>;
  return !!x && typeof x.seq === 'number' && ['time', 'kind', 'source', 'detail', 'evidence', 'prevHash', 'hash'].every((k) => typeof x[k] === 'string');
};

export const decryptLedger = async (raw: string, passphrase: string): Promise<readonly LedgerEntry[]> => {
  let file: BackupFile;
  try { file = JSON.parse(raw); } catch { throw new Error('Plik nie jest kopią dziennika.'); }
  if (file?.v !== 1 || file.alg !== 'AES-GCM' || typeof file.data !== 'string' || typeof file.iter !== 'number' || file.iter < 100_000) throw new Error('Nieobsługiwany format kopii.');
  let plain: ArrayBuffer;
  try {
    const key = await deriveKey(passphrase, unb64(file.salt), file.iter);
    plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(file.iv) }, key, unb64(file.data));
  } catch { throw new Error('Złe hasło albo plik został zmieniony.'); }
  const parsed: unknown = JSON.parse(new TextDecoder().decode(plain));
  if (!Array.isArray(parsed) || !parsed.every(isEntry)) throw new Error('Nieprawidłowa zawartość kopii.');
  if (!verifyChain(parsed)) throw new Error('Weryfikacja integralności nie powiodła się — łańcuch naruszony.');
  return Object.freeze(parsed.map((e) => Object.freeze({ ...e })));
};
