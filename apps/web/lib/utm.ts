/**
 * UTM parameter tracking — captures and persists UTM params through signup flow.
 * Stored in sessionStorage (survives page navigation, cleared on tab close).
 * Also written to localStorage for longer attribution windows.
 */

export interface UTMParams {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  referral_code?: string
  captured_at?: string
}

const SESSION_KEY = "sovv_utm"
const LOCAL_KEY = "sovv_utm_persistent"

/** Capture UTM params from current URL and persist them */
export function captureUTM(): UTMParams | null {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  const utm: UTMParams = {}

  const fields: (keyof UTMParams)[] = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "referral_code",
  ]

  let hasAny = false
  for (const field of fields) {
    const val = params.get(field)
    if (val) {
      utm[field] = val
      hasAny = true
    }
  }

  if (!hasAny) return null

  utm.captured_at = new Date().toISOString()

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(utm))
    // Only write to localStorage if not already set (first-touch attribution)
    if (!localStorage.getItem(LOCAL_KEY)) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(utm))
    }
  } catch {
    // Storage unavailable — ignore
  }

  return utm
}

/** Retrieve stored UTM params (session-first, then local) */
export function getStoredUTM(): UTMParams | null {
  if (typeof window === "undefined") return null

  try {
    const session = sessionStorage.getItem(SESSION_KEY)
    if (session) return JSON.parse(session)

    const local = localStorage.getItem(LOCAL_KEY)
    if (local) return JSON.parse(local)
  } catch {
    // ignore
  }

  return null
}

/** Clear UTM params after successful signup attribution */
export function clearUTM() {
  if (typeof window === "undefined") return
  try {
    sessionStorage.removeItem(SESSION_KEY)
    // Keep localStorage for post-signup analysis
  } catch {
    // ignore
  }
}

/** Append stored UTM params to a URL */
export function appendUTMToURL(url: string, utm: UTMParams): string {
  const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://defrag.app")
  const fields: (keyof UTMParams)[] = [
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "referral_code",
  ]
  for (const field of fields) {
    if (utm[field]) u.searchParams.set(field, utm[field] as string)
  }
  return u.toString()
}