/** Token-bucket abuse guard for the public ALFA Bridge demo. Pure and deterministic for testing. */
export interface Bucket { tokens: number; updatedAt: number }
export interface GuardConfig { capacity: number; refillPerSec: number }

export const DEFAULT_GUARD: GuardConfig = { capacity: 5, refillPerSec: 1 };

export const takeToken = (bucket: Bucket | undefined, now: number, cfg: GuardConfig = DEFAULT_GUARD): { allowed: boolean; bucket: Bucket } => {
  const prev = bucket ?? { tokens: cfg.capacity, updatedAt: now };
  const refilled = Math.min(cfg.capacity, prev.tokens + ((now - prev.updatedAt) / 1000) * cfg.refillPerSec);
  if (refilled < 1) return { allowed: false, bucket: { tokens: refilled, updatedAt: now } };
  return { allowed: true, bucket: { tokens: refilled - 1, updatedAt: now } };
};

/** Mutual-token check: bridge and core must each present the other's token. */
export const mutualTokensValid = (bridgeHoldsCore: string, coreToken: string, coreHoldsBridge: string, bridgeToken: string) =>
  bridgeHoldsCore.length > 0 && coreHoldsBridge.length > 0 && bridgeHoldsCore === coreToken && coreHoldsBridge === bridgeToken;
