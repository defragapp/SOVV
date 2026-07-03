/** localStorage key used to persist the local tier flag after a Stripe checkout. */
export const LOCAL_TIER_KEY = 'sovv_tier';

/** Read the local tier flag. Returns true if the device has a premium unlock. */
export function readLocalTier(): boolean {
  try {
    return localStorage.getItem(LOCAL_TIER_KEY) === 'premium';
  } catch {
    return false;
  }
}

/** Persist the premium flag. Call once after Stripe success redirect. */
export function setLocalPremium(): void {
  try {
    localStorage.setItem(LOCAL_TIER_KEY, 'premium');
  } catch {
    // storage unavailable — ignore
  }
}
