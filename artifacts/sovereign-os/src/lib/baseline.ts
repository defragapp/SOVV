/** localStorage key for the user's Baseline Design data. */
const BASELINE_KEY = 'sovv_baseline';

export interface BaselineData {
  /** Date of birth — YYYY-MM-DD — required for baseline computation. */
  dob: string;
  /** Place of birth — city/region/country — required. */
  pob: string;
  /** Time of birth — approximate ok (e.g. "14:30" or "morning") — optional; empty = not provided. */
  tob: string;
}

/** Read saved baseline, returns null if onboarding not yet completed. */
export function readBaseline(): BaselineData | null {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BaselineData>;
    // Must have at least a dob to be considered complete
    if (!parsed.dob) return null;
    return { dob: parsed.dob, pob: parsed.pob ?? '', tob: parsed.tob ?? '' };
  } catch {
    return null;
  }
}

/**
 * Persist the baseline after onboarding completion.
 * Saves to localStorage and awaits the API sync so callers can show a loading state.
 */
export async function saveBaseline(data: BaselineData): Promise<void> {
  try {
    localStorage.setItem(BASELINE_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable — continue to API sync
  }
  try {
    await fetch('/api/baseline', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dob: data.dob, tob: data.tob, pob: data.pob }),
    });
  } catch {
    // Offline or unauthenticated — localStorage is the source of truth
  }
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
      const data = await res.json() as Partial<BaselineData> | null;
      if (data?.dob) {
        localStorage.setItem(BASELINE_KEY, JSON.stringify(data));
      }
    }
  } catch { /* network error — ignore */ }
}

/** Quick boolean check: returns true if a completed baseline exists locally. */
export function checkHasBaseline(): boolean {
  try {
    const raw = localStorage.getItem(BASELINE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as Partial<BaselineData>;
    return Boolean(parsed.dob);
  } catch {
    return false;
  }
}
