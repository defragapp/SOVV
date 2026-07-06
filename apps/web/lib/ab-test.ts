/**
 * A/B test infrastructure — cookie-based variant assignment.
 * Variants persist across sessions for consistent user experience.
 * Tracks through to conversion via UTM-style attribution.
 */

export interface ABTest {
  id: string
  variants: string[]
  weights?: number[] // must sum to 1; defaults to equal distribution
}

export interface ABAssignment {
  testId: string
  variant: string
  assignedAt: string
}

const COOKIE_PREFIX = "sovv_ab_"
const STORAGE_KEY = "sovv_ab_assignments"

/** Deterministically assign a variant based on a random value */
function pickVariant(variants: string[], weights?: number[]): string {
  const rand = Math.random()
  if (!weights || weights.length !== variants.length) {
    // Equal distribution
    const idx = Math.floor(rand * variants.length)
    return variants[idx]
  }
  let cumulative = 0
  for (let i = 0; i < variants.length; i++) {
    cumulative += weights[i]
    if (rand < cumulative) return variants[i]
  }
  return variants[variants.length - 1]
}

/** Get or assign a variant for a test */
export function getVariant(test: ABTest): string {
  if (typeof window === "undefined") return test.variants[0]

  const storageKey = `${STORAGE_KEY}_${test.id}`

  try {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      const assignment: ABAssignment = JSON.parse(stored)
      if (test.variants.includes(assignment.variant)) {
        return assignment.variant
      }
    }
  } catch {
    // ignore
  }

  // Assign new variant
  const variant = pickVariant(test.variants, test.weights)
  const assignment: ABAssignment = {
    testId: test.id,
    variant,
    assignedAt: new Date().toISOString(),
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(assignment))
  } catch {
    // ignore
  }

  // Track assignment
  trackABEvent(test.id, variant, "assigned")

  return variant
}

/** Track an A/B test event (assignment, conversion, etc.) */
export function trackABEvent(
  testId: string,
  variant: string,
  event: "assigned" | "converted" | "viewed",
  metadata?: Record<string, string>
) {
  if (typeof window === "undefined") return

  // Send to analytics if available
  if ((window as any).gtag) {
    (window as any).gtag("event", `ab_${event}`, {
      ab_test_id: testId,
      ab_variant: variant,
      ...metadata,
    })
  }

  // Also store locally for debugging
  try {
    const log = JSON.parse(localStorage.getItem("sovv_ab_log") || "[]")
    log.push({ testId, variant, event, timestamp: new Date().toISOString(), ...metadata })
    localStorage.setItem("sovv_ab_log", JSON.stringify(log.slice(-100))) // keep last 100
  } catch {
    // ignore
  }
}

/** Get all current A/B assignments (for sending with signup) */
export function getAllAssignments(): Record<string, string> {
  if (typeof window === "undefined") return {}

  const assignments: Record<string, string> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(STORAGE_KEY)) {
        const val = localStorage.getItem(key)
        if (val) {
          const assignment: ABAssignment = JSON.parse(val)
          assignments[assignment.testId] = assignment.variant
        }
      }
    }
  } catch {
    // ignore
  }
  return assignments
}

// ── Defined tests ─────────────────────────────────────────────────────────────

export const PRICING_PAGE_TEST: ABTest = {
  id: "pricing_page_v1",
  variants: ["control", "annual_first", "trial_emphasis"],
  weights: [0.34, 0.33, 0.33],
}

export const HERO_CTA_TEST: ABTest = {
  id: "hero_cta_v1",
  variants: ["enter", "start_free", "see_how"],
  weights: [0.34, 0.33, 0.33],
}