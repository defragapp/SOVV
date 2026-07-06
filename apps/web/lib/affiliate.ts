/**
 * Affiliate/partner link system — client-side tracking utilities.
 * Affiliate codes are captured from URL params and persisted for attribution.
 */

const AFFILIATE_KEY = "sovv_affiliate"

export interface AffiliateAttribution {
  code: string
  partnerId?: string
  capturedAt: string
  landingPage: string
}

/** Capture affiliate code from URL (?ref=CODE or ?aff=CODE) */
export function captureAffiliateCode(): AffiliateAttribution | null {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  const code = params.get("ref") || params.get("aff") || params.get("affiliate")
  if (!code) return null

  const attribution: AffiliateAttribution = {
    code,
    capturedAt: new Date().toISOString(),
    landingPage: window.location.pathname,
  }

  try {
    // First-touch: only store if not already attributed
    if (!localStorage.getItem(AFFILIATE_KEY)) {
      localStorage.setItem(AFFILIATE_KEY, JSON.stringify(attribution))
    }
  } catch {
    // ignore
  }

  return attribution
}

/** Get stored affiliate attribution */
export function getAffiliateAttribution(): AffiliateAttribution | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(AFFILIATE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/** Generate an affiliate link for a given code */
export function buildAffiliateLink(code: string, path = "/"): string {
  const base = typeof window !== "undefined"
    ? window.location.origin
    : "https://defrag.app"
  const url = new URL(path, base)
  url.searchParams.set("ref", code)
  return url.toString()
}

/** Clear affiliate attribution after successful conversion */
export function clearAffiliateAttribution() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(AFFILIATE_KEY)
  } catch {
    // ignore
  }
}