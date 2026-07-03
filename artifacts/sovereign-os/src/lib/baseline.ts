/** localStorage key for the user's Baseline Design data. */
const BASELINE_KEY = 'sovv_baseline';

export interface BaselineData {
  defaultRetreat: string;   // Step 1: where they go when conflict spikes
  coreBoundary: string;     // Step 2: the line that collapses clarity
  repairMechanic: string;   // Step 3: how they attempt to fix the break
}

/** Read saved baseline, returns null if not yet completed. */
export function readBaseline(): BaselineData | null {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BaselineData;
  } catch {
    return null;
  }
}

/** Persist the baseline after onboarding completion. */
export function saveBaseline(data: BaselineData): void {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — ignore
  }
}

/** Quick boolean check without parsing. */
export function checkHasBaseline(): boolean {
  try {
    return Boolean(localStorage.getItem(BASELINE_KEY));
  } catch {
    return false;
  }
}
