/** ECDSA P-256 signing of incident reports. The private key is non-extractable and lives only in this browser session. */
export interface SignedReport<T> { payload: T; signature: string; publicKey: JsonWebKey; alg: 'ECDSA-P256-SHA256' }

let pair: Promise<CryptoKeyPair> | null = null;
const keys = () => (pair ??= crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign', 'verify']));
const b64 = (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b)));
const unb64 = (s: string) => { const r = atob(s); const o = new Uint8Array(new ArrayBuffer(r.length)); for (let i = 0; i < r.length; i += 1) o[i] = r.charCodeAt(i); return o; };

/** Canonical JSON: sorted keys so the signature is stable. */
export const canonical = (v: unknown): string => {
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  if (v && typeof v === 'object') return `{${Object.keys(v as object).sort().map((k) => `${JSON.stringify(k)}:${canonical((v as Record<string, unknown>)[k])}`).join(',')}}`;
  return JSON.stringify(v);
};

export const signReport = async <T>(payload: T): Promise<SignedReport<T>> => {
  const { privateKey, publicKey } = await keys();
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, new TextEncoder().encode(canonical(payload)));
  return { payload, signature: b64(sig), publicKey: await crypto.subtle.exportKey('jwk', publicKey), alg: 'ECDSA-P256-SHA256' };
};

export const verifyReport = async (raw: string): Promise<boolean> => {
  try {
    const r = JSON.parse(raw) as SignedReport<unknown>;
    if (r.alg !== 'ECDSA-P256-SHA256' || typeof r.signature !== 'string') return false;
    const key = await crypto.subtle.importKey('jwk', r.publicKey, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key, unb64(r.signature), new TextEncoder().encode(canonical(r.payload)));
  } catch { return false; }
};
