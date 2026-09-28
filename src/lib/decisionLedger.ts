/**
 * Append-only, hash-chained decision ledger (browser-local simulation).
 * Entries are frozen; each hash covers the previous hash, so any edit breaks the chain.
 */
export type LedgerKind = 'ORACLE_DECISION' | 'HOLD_RAISED' | 'HOLD_RESOLVED' | 'GUARDIAN_STOP' | 'GUARDIAN_RELEASE' | 'CERBER_VERDICT';

export interface LedgerEntry {
  readonly seq: number;
  readonly time: string;
  readonly kind: LedgerKind;
  readonly source: string;
  readonly detail: string;
  readonly evidence: string;
  readonly prevHash: string;
  readonly hash: string;
}

const GENESIS = '00000000';

/** FNV-1a 32-bit — deterministic integrity fingerprint for the demo chain (not a cryptographic signature). */
const fnv1a = (input: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
};

const digest = (e: Omit<LedgerEntry, 'hash'>) => fnv1a([e.seq, e.time, e.kind, e.source, e.detail, e.evidence, e.prevHash].join('|'));

export const appendEntry = (
  ledger: readonly LedgerEntry[],
  entry: Pick<LedgerEntry, 'kind' | 'source' | 'detail' | 'evidence'>,
): readonly LedgerEntry[] => {
  const prev = ledger[ledger.length - 1];
  const base = { ...entry, seq: ledger.length + 1, time: new Date().toISOString(), prevHash: prev?.hash ?? GENESIS };
  return Object.freeze([...ledger, Object.freeze({ ...base, hash: digest(base) })]);
};

export const verifyChain = (ledger: readonly LedgerEntry[]) =>
  ledger.every((e, i) => e.prevHash === (i === 0 ? GENESIS : ledger[i - 1].hash) && e.hash === digest(e));
