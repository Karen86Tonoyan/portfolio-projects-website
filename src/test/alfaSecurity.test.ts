import { describe, expect, it } from 'vitest';
import { appendEntry, verifyChain, type LedgerEntry } from '@/lib/decisionLedger';
import { decryptLedger, encryptLedger } from '@/lib/ledgerBackup';
import { mutualTokensValid, takeToken, type Bucket } from '@/lib/gatewayGuard';

const sample = () => {
  let l: readonly LedgerEntry[] = [];
  l = appendEntry(l, { kind: 'HOLD_RAISED', source: 'AI-A', detail: 'd1', evidence: 'e1' });
  l = appendEntry(l, { kind: 'HOLD_RESOLVED', source: 'Cerber', detail: 'd2', evidence: 'e2' });
  return l;
};

describe('decision ledger', () => {
  it('is frozen and chain-valid', () => {
    const l = sample();
    expect(verifyChain(l)).toBe(true);
    expect(Object.isFrozen(l)).toBe(true);
    expect(Object.isFrozen(l[0])).toBe(true);
  });
  it('detects tampering', () => {
    const l = sample().map((e) => ({ ...e }));
    l[0].detail = 'zmienione';
    expect(verifyChain(l)).toBe(false);
  });
});

describe('encrypted backup', () => {
  const pass = 'bardzo-dlugie-haslo';
  it('round-trips with integrity check', async () => {
    const l = sample();
    const restored = await decryptLedger(await encryptLedger(l, pass), pass);
    expect(restored).toEqual(l);
  });
  it('rejects wrong passphrase', async () => {
    await expect(decryptLedger(await encryptLedger(sample(), pass), 'inne-haslo-12345')).rejects.toThrow();
  });
  it('rejects modified ciphertext', async () => {
    const file = JSON.parse(await encryptLedger(sample(), pass));
    file.data = file.data.slice(0, -4) + (file.data.endsWith('AAAA') ? 'BBBB' : 'AAAA');
    await expect(decryptLedger(JSON.stringify(file), pass)).rejects.toThrow();
  });
  it('rejects short passphrase', async () => {
    await expect(encryptLedger(sample(), 'krotkie')).rejects.toThrow();
  });
});

describe('public gateway guard', () => {
  it('blocks bursts beyond capacity and refills over time', () => {
    let b: Bucket | undefined;
    const results = Array.from({ length: 8 }, () => { const r = takeToken(b, 0); b = r.bucket; return r.allowed; });
    expect(results.filter(Boolean)).toHaveLength(5);
    expect(takeToken(b, 2000).allowed).toBe(true);
  });
  it('breaks the bridge when one token is stolen', () => {
    expect(mutualTokensValid('c', 'c', 'b', 'b')).toBe(true);
    expect(mutualTokensValid('stolen', 'c', 'b', 'b')).toBe(false);
    expect(mutualTokensValid('', '', 'b', 'b')).toBe(false);
  });
});
