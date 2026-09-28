import { describe, expect, it } from 'vitest';
import { TokenVault, type VaultEvent } from '@/lib/splitToken';

const P1 = 'pierwsze-haslo';
const P2 = 'drugie-haslo!!';
const setup = (ttl = 60_000) => {
  let t = 1_000_000;
  const events: VaultEvent[] = [];
  const vault = new TokenVault(ttl, { threshold: 3, baseDelayMs: 1000, maxDelayMs: 8000 }, () => t, (e) => events.push(e));
  return { vault, events, advance: (ms: number) => { t += ms; } };
};

describe('split token + Cerber', () => {
  it('PASS only with both passwords and the matching half', async () => {
    const { vault } = setup();
    const { clientId, clientHalf } = await vault.issue(P1, P2);
    expect((await vault.verify(clientId, P1, P2, clientHalf)).decision).toBe('PASS');
  });

  it('requires both passwords', async () => {
    const { vault } = setup();
    const { clientId, clientHalf } = await vault.issue(P1, P2);
    expect(await vault.verify(clientId, P1, 'zle-haslo-xx', clientHalf)).toMatchObject({ decision: 'DENY', reason: 'BAD_PASSWORD' });
    expect(await vault.verify(clientId, P2, P1, clientHalf)).toMatchObject({ decision: 'DENY', reason: 'BAD_PASSWORD' });
  });

  it('rejects a wrong or malformed half', async () => {
    const { vault } = setup();
    const { clientId } = await vault.issue(P1, P2);
    expect(await vault.verify(clientId, P1, P2, '00'.repeat(16))).toMatchObject({ reason: 'BAD_HALF' });
    expect(await vault.verify(clientId, P1, P2, 'nie-hex')).toMatchObject({ reason: 'BAD_HALF' });
  });

  it('denies expired tokens', async () => {
    const { vault, advance } = setup(1000);
    const { clientId, clientHalf } = await vault.issue(P1, P2);
    advance(1001);
    expect(await vault.verify(clientId, P1, P2, clientHalf)).toMatchObject({ reason: 'EXPIRED' });
  });

  it('denies revoked tokens and drops the Oracle half', async () => {
    const { vault } = setup();
    const { clientId, clientHalf } = await vault.issue(P1, P2);
    vault.revoke(clientId);
    expect(vault.oracleHalfCount).toBe(0);
    expect(await vault.verify(clientId, P1, P2, clientHalf)).toMatchObject({ reason: 'REVOKED' });
  });

  it('rotation invalidates the old half immediately', async () => {
    const { vault } = setup();
    const { clientId, clientHalf } = await vault.issue(P1, P2);
    const fresh = await vault.rotate(clientId);
    expect(await vault.verify(clientId, P1, P2, clientHalf)).toMatchObject({ reason: 'BAD_HALF' });
    expect((await vault.verify(clientId, P1, P2, fresh)).decision).toBe('PASS');
  });

  it('locks out with growing delays after repeated failures', async () => {
    const { vault, advance, events } = setup();
    const { clientId, clientHalf } = await vault.issue(P1, P2);
    for (let i = 0; i < 3; i += 1) await vault.verify(clientId, 'zle-haslo-xx', P2, clientHalf);
    expect(await vault.verify(clientId, P1, P2, clientHalf)).toMatchObject({ reason: 'LOCKED' });
    advance(1001);
    await vault.verify(clientId, 'zle-haslo-xx', P2, clientHalf);
    expect(vault.status(clientId)!.lockedUntil - 1_001_001).toBe(2000);
    expect(events.filter((e) => e.type === 'LOCKOUT')).toHaveLength(2);
  });

  it('rejects weak or identical passwords at issue', async () => {
    const { vault } = setup();
    await expect(vault.issue('krotkie', P2)).rejects.toThrow();
    await expect(vault.issue(P1, P1)).rejects.toThrow();
  });
});
