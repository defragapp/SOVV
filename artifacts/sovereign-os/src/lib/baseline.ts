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

/** Persist the baseline after onboarding completion. Saves locally and syncs to API. */
export function saveBaseline(data: BaselineData): void {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — ignore
  }
  // Fire-and-forget: sync to backend for cross-device persistence
  fetch('/api/baseline', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).catch(() => {
    // Offline or unauthenticated — localStorage is the source of truth
  });
}

/**
 * Attempt to load baseline from the API and hydrate localStorage if empty.
 * Call once on app startup for authenticated users.
 */
export async function hydrateBaseline(): Promise<void> {
  if (checkHasBaseline()) return; // already in localStorage
  try {
    const res = await fetch('/api/baseline', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json() as BaselineData | null;
      if (data?.defaultRetreat) {
        localStorage.setItem(BASELINE_KEY, JSON.stringify(data));
      }
    }
  } catch { /* network error — ignore */ }
}

/** Quick boolean check without parsing. */
export function checkHasBaseline(): boolean {
  try {
    return Boolean(localStorage.getItem(BASELINE_KEY));
  } catch {
    return false;
  }
}
