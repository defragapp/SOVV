/**
 * outputContract.ts
 *
 * Unified output contract for Sovereign.os.
 *
 * All three Spaces (Defrag, Alignment, Covenant) produce outputs that
 * conform to this shape. Pages become views — they read from this contract,
 * not from ad-hoc API response shapes.
 *
 * Migration path:
 *   Phase 1: Introduce type (this file)
 *   Phase 2: processInput returns SystemOutput
 *   Phase 3: systemStore holds SystemOutput
 *   Phase 4: Spaces render from SystemOutput (Defrag first)
 *   Phase 5: Alignment + Covenant adopt same contract
 */

// ── Core output shape ─────────────────────────────────────────────────────────

export type SystemOutput = {
  /** The primary insight — the one thing the user needs to see */
  primary: string

  /** Supporting context — what's underneath the primary */
  secondary?: string

  /** Structured metadata — space-specific fields, rail data, flow hints */
  meta?: Record<string, unknown>

  /** Which space produced this output */
  space: "defrag" | "alignment" | "covenant"

  /** ISO timestamp of when output was received */
  receivedAt: string
}

// ── Space-specific meta shapes (for type-safe access) ─────────────────────────

export type DefragMeta = {
  summary?: string
  activePattern?: string
  theRepeat?: string
  oldRole?: string
  whatYouLearnedToCarry?: string
  strainPattern?: string
  giftUnderStrain?: string
  alignment?: string
  bestNextResponse?: { summary?: string; phrasing?: string[] } | string
  conversationalSteering?: { do?: string[]; avoid?: string[] }
  sourcesUsed?: { baseline?: boolean; history?: boolean; invitedUsers?: boolean }
  media?: { audioOverviewAvailable?: boolean; watchPreviewAvailable?: boolean }
  signature?: string
  rail?: {
    baseline?: { pace?: string; stabilizes?: string; responds?: string }
    sky?: { urgency?: string; tolerance?: string; state?: string }
    pattern?: { loop?: string }
  }
  flow?: { nextSpace?: string; urgency?: string }
}

export type AlignmentMeta = {
  skyContext?: string
  whatIsTrue?: string
  whatIsYours?: string
  whatIsNotYours?: string
  theShift?: string
  nextStep?: string
  avoid?: string
}

export type CovenantMeta = {
  forYou?: string
  whatIsTrue?: string
  figure?: string
  pattern?: string
  nextStep?: string
  reflectionPrompts?: string[]
}

// ── Adapters: convert raw API responses → SystemOutput ────────────────────────

/**
 * Convert a raw Defrag API response to SystemOutput.
 * primary = activePattern (the core insight)
 * secondary = alignment (the actionable direction)
 * meta = everything else
 */
export function defragToSystemOutput(raw: Record<string, unknown>): SystemOutput {
  const primary = (raw.activePattern as string) || (raw.summary as string) || ""
  const secondary = (raw.alignment as string) || undefined

  return {
    primary,
    secondary,
    meta: raw as DefragMeta,
    space: "defrag",
    receivedAt: new Date().toISOString(),
  }
}

/**
 * Convert a raw Alignment API response to SystemOutput.
 * primary = whatIsYours (what belongs to the user)
 * secondary = theShift (the actionable direction)
 */
export function alignmentToSystemOutput(raw: Record<string, unknown>): SystemOutput {
  const primary = (raw.whatIsYours as string) || (raw.whatIsTrue as string) || ""
  const secondary = (raw.theShift as string) || undefined

  return {
    primary,
    secondary,
    meta: raw as AlignmentMeta,
    space: "alignment",
    receivedAt: new Date().toISOString(),
  }
}

/**
 * Convert a raw Covenant API response to SystemOutput.
 * primary = forYou (the personal application)
 * secondary = pattern (the narrative pattern)
 */
export function covenantToSystemOutput(raw: Record<string, unknown>): SystemOutput {
  const primary = (raw.forYou as string) || (raw.whatIsTrue as string) || ""
  const secondary = (raw.pattern as string) || undefined

  return {
    primary,
    secondary,
    meta: raw as CovenantMeta,
    space: "covenant",
    receivedAt: new Date().toISOString(),
  }
}
