/**
 * active-signals.ts — Baseline Active Signal Selection System
 *
 * Pipeline:
 *   BaselineDesignDataset (full compute, server-side only)
 *   → selectActiveSignals()   — context-aware reduction
 *   → buildBaselineSignature() — compressed identity line
 *   → buildRailData()          — structured right-panel data
 *   → formatActiveSignalsForPrompt() — AI-ready context string
 *
 * The full compute never leaves the server.
 * Only reduced, translated signals reach the AI or the client.
 *
 * Signature line format:
 *   HD: 5/1 · TYPE: Generator · AUTH: Sacral · GK: 13/33 · RIS: Leo · NOD: 2/8
 */

import type { BaselineDesignDataset } from "./baseline-compiler.js"

// ── Types ─────────────────────────────────────────────────────────────────────

/** Compressed identity signature — shown once, bottom of result surface */
export interface BaselineSignature {
  /** Encoded one-line signature: "HD: 5/1 · TYPE: Generator · AUTH: Sacral · GK: 13/33 · RIS: Leo · NOD: 2/8" */
  line: string
  /** Individual tokens for structured rendering */
  tokens: Array<{ key: string; value: string }>
}

/** Reduced behavioral signals — context-aware subset of full compute */
export interface ActiveBaselineSignals {
  /** How this person moves under pressure */
  pace: "fast" | "slow" | "variable" | "unknown"
  /** What stabilizes them */
  stabilizes: string
  /** How they respond to pressure */
  pressureResponse: string
  /** What they protect */
  protects: string
  /** Primary pattern tendency */
  patternTendency: string
  /** Evidence tags (framework references, kept internal) */
  evidenceTags: string[]
  /** Human-readable trait lines for AI context */
  traitLines: string[]
}

/** Timing signals from current sky / activation state */
export interface TimingSignals {
  urgency: "high" | "medium" | "low"
  sensitivity: "high" | "medium" | "low"
  tolerance: "high" | "medium" | "low"
  pacing: "fast" | "slow" | "normal"
  /** Plain-language timing note for AI context */
  note: string
}

/** Overlay signals — what forms between two people */
export interface OverlaySignals {
  /** The loop that forms */
  loop: string
  /** Why it's stronger now */
  amplifier: string
  /** Where the leverage is */
  leverage: string
}

/** Rail section data — structured for the right panel */
export interface RailSectionData {
  baseline: {
    pace: string
    stabilizes: string
    pressureResponse: string
    patternTendency: string
  }
  sky: {
    urgency: string
    sensitivity: string
    tolerance: string
  }
  pattern: string
  signature: string
}

/** Export payload — human-readable, no raw compute */
export interface ExportPayload {
  result: Record<string, unknown>
  patternSummary: string
  timingState: string
  reducedSignals: ActiveBaselineSignals
  signature: string
}

// ── Signature builder ─────────────────────────────────────────────────────────

/**
 * Build the compressed identity signature line from the full compute.
 * Format: HD: 5/1 · TYPE: Generator · AUTH: Sacral · GK: 13/33 · RIS: Leo · NOD: 2/8
 */
export function buildBaselineSignature(dataset: BaselineDesignDataset): BaselineSignature {
  const tokens: Array<{ key: string; value: string }> = []

  const hd = dataset.frameworks?.humanDesign
  const ast = dataset.frameworks?.astrology
  const gk = dataset.frameworks?.geneKeys

  // HD profile
  if (hd?.profile) {
    tokens.push({ key: "HD", value: hd.profile })
  }

  // HD type
  if (hd?.type) {
    tokens.push({ key: "TYPE", value: hd.type })
  }

  // HD authority
  if (hd?.authority) {
    tokens.push({ key: "AUTH", value: hd.authority })
  }

  // Gene Keys — primary activation (first activation, sphere if available)
  if (gk?.activations?.length) {
    const primary = gk.activations[0]
    const gkLabel = primary.sphere
      ? `${primary.key}/${primary.line} (${primary.sphere})`
      : `${primary.key}/${primary.line}`
    tokens.push({ key: "GK", value: gkLabel })
  }

  // Rising sign (ascendant)
  if (ast?.ascendant?.sign) {
    tokens.push({ key: "RIS", value: ast.ascendant.sign })
  }

  // Nodal axis — north node sign if available
  const northNode = ast?.placements?.find(p => p.body === "NorthNode" || p.body === "True Node")
  if (northNode?.sign) {
    tokens.push({ key: "NOD", value: northNode.sign })
  }

  // Fallback: use DOB if no framework data computed yet
  if (tokens.length === 0) {
    tokens.push({ key: "DOB", value: dataset.input.dob })
    tokens.push({ key: "POB", value: dataset.input.pob })
  }

  const line = tokens.map(t => `${t.key}: ${t.value}`).join(" · ")

  return { line, tokens }
}

// ── Active signal selector ────────────────────────────────────────────────────

/**
 * Select the active behavioral signals from the full compute.
 * Context-aware: uses thread content and relational mode to weight signals.
 *
 * Rules:
 * - Never dump all baseline variables
 * - Select only what is relevant to the current moment
 * - Translate framework data into behavioral language
 * - Keep evidence tags internal (not shown to user)
 */
export function selectActiveSignals(
  dataset: BaselineDesignDataset,
  context: {
    message: string
    relational: boolean
    mode: "self" | "pair" | "group" | "situation"
  }
): ActiveBaselineSignals {
  const hd = dataset.frameworks?.humanDesign
  const ast = dataset.frameworks?.astrology
  const aiData = dataset.aiDataset

  // ── Pace: derived from HD type + authority ────────────────────────────────
  let pace: ActiveBaselineSignals["pace"] = "unknown"
  if (hd?.type) {
    const fastTypes = ["Manifestor", "Manifesting Generator"]
    const slowTypes = ["Projector", "Reflector"]
    if (fastTypes.some(t => hd.type?.includes(t))) pace = "fast"
    else if (slowTypes.some(t => hd.type?.includes(t))) pace = "slow"
    else pace = "variable" // Generator
  }

  // ── Stabilizes: what brings them back to center ───────────────────────────
  let stabilizes = "clarity"
  if (hd?.authority) {
    const auth = hd.authority.toLowerCase()
    if (auth.includes("sacral")) stabilizes = "gut response"
    else if (auth.includes("emotional") || auth.includes("solar plexus")) stabilizes = "emotional clarity over time"
    else if (auth.includes("splenic")) stabilizes = "in-the-moment instinct"
    else if (auth.includes("self") || auth.includes("g center")) stabilizes = "identity alignment"
    else if (auth.includes("ego") || auth.includes("heart")) stabilizes = "willpower and commitment"
    else if (auth.includes("mental") || auth.includes("outer")) stabilizes = "trusted outside perspective"
    else if (auth.includes("lunar")) stabilizes = "full lunar cycle"
  }

  // ── Pressure response: from derived traits if available ───────────────────
  let pressureResponse = "moves toward resolution"
  if (aiData?.derivedTraits?.length) {
    const pressureTrait = aiData.derivedTraits.find(t =>
      t.key.includes("pressure") || t.key.includes("strain") || t.key.includes("pace")
    )
    if (pressureTrait?.overExpression?.[0]) {
      pressureResponse = pressureTrait.overExpression[0]
    }
  }

  // ── Protects: from identity anchors or sun sign ───────────────────────────
  let protects = "autonomy"
  if (aiData?.identityAnchors?.length) {
    const anchor = aiData.identityAnchors[0]
    if (anchor.toLowerCase().includes("space")) protects = "space"
    else if (anchor.toLowerCase().includes("connection")) protects = "connection"
    else if (anchor.toLowerCase().includes("clarity")) protects = "clarity"
    else if (anchor.toLowerCase().includes("stability")) protects = "stability"
    else if (anchor.toLowerCase().includes("purpose")) protects = "purpose"
  } else if (ast?.placements) {
    const sun = ast.placements.find(p => p.body === "Sun")
    if (sun?.sign) {
      const fireSign = ["Aries", "Leo", "Sagittarius"].includes(sun.sign)
      const earthSign = ["Taurus", "Virgo", "Capricorn"].includes(sun.sign)
      const airSign = ["Gemini", "Libra", "Aquarius"].includes(sun.sign)
      if (fireSign) protects = "autonomy and forward motion"
      else if (earthSign) protects = "stability and reliability"
      else if (airSign) protects = "clarity and connection"
      else protects = "depth and meaning"
    }
  }

  // ── Pattern tendency: from appOverlays.defrag ─────────────────────────────
  let patternTendency = "moves early under pressure"
  if (aiData?.appOverlays?.defrag?.likelyLoops?.length) {
    patternTendency = aiData.appOverlays.defrag.likelyLoops[0]
  }

  // ── Evidence tags (internal, not shown to user) ───────────────────────────
  const evidenceTags: string[] = []
  if (hd?.profile) evidenceTags.push(`HD ${hd.profile}`)
  if (hd?.type) evidenceTags.push(hd.type)
  if (hd?.authority) evidenceTags.push(hd.authority)
  if (ast?.placements) {
    const sun = ast.placements.find(p => p.body === "Sun")
    const moon = ast.placements.find(p => p.body === "Moon")
    if (sun) evidenceTags.push(`Sun in ${sun.sign}`)
    if (moon) evidenceTags.push(`Moon in ${moon.sign}`)
  }

  // ── Trait lines: human-readable for AI context ────────────────────────────
  const traitLines: string[] = []
  if (aiData?.derivedTraits?.length) {
    // Select top 3 most relevant traits based on context
    const relevantTraits = aiData.derivedTraits
      .filter(t => {
        if (context.relational) {
          return t.key.includes("relational") || t.key.includes("pressure") ||
                 t.key.includes("pace") || t.key.includes("emotional")
        }
        return true
      })
      .slice(0, 3)

    for (const trait of relevantTraits) {
      if (trait.alignedExpression?.[0]) {
        traitLines.push(trait.alignedExpression[0])
      }
    }
  }

  // Fallback trait lines from identity anchors
  if (traitLines.length === 0 && aiData?.identityAnchors?.length) {
    traitLines.push(...aiData.identityAnchors.slice(0, 2))
  }

  return {
    pace,
    stabilizes,
    pressureResponse,
    protects,
    patternTendency,
    evidenceTags,
    traitLines,
  }
}

// ── Timing signal mapper ──────────────────────────────────────────────────────

/**
 * Derive timing signals from current sky context.
 * If no live sky data is available, returns neutral defaults.
 * Timing explains activation, not fate.
 */
export function buildTimingSignals(dataset: BaselineDesignDataset): TimingSignals {
  // If no astronomy data, return neutral
  if (!dataset.astronomy) {
    return {
      urgency: "medium",
      sensitivity: "medium",
      tolerance: "medium",
      pacing: "normal",
      note: "No current sky data available.",
    }
  }

  const bodies = dataset.astronomy.bodies
  let urgency: TimingSignals["urgency"] = "medium"
  let sensitivity: TimingSignals["sensitivity"] = "medium"
  let tolerance: TimingSignals["tolerance"] = "medium"
  let pacing: TimingSignals["pacing"] = "normal"
  const notes: string[] = []

  // Mars retrograde → lower tolerance, higher urgency
  if (bodies["Mars"]?.retrograde) {
    urgency = "high"
    tolerance = "low"
    notes.push("Mars retrograde — urgency is higher than usual, tolerance is lower")
  }

  // Mercury retrograde → communication sensitivity up
  if (bodies["Mercury"]?.retrograde) {
    sensitivity = "high"
    notes.push("Mercury retrograde — communication lands differently right now")
  }

  // Saturn retrograde → pacing slows, pressure to review
  if (bodies["Saturn"]?.retrograde) {
    pacing = "slow"
    notes.push("Saturn retrograde — things are moving slower than they feel")
  }

  // Venus retrograde → relational sensitivity high
  if (bodies["Venus"]?.retrograde) {
    sensitivity = "high"
    notes.push("Venus retrograde — relational dynamics are more charged than usual")
  }

  const note = notes.length > 0
    ? notes.join(". ")
    : "Current timing is within normal range."

  return { urgency, sensitivity, tolerance, pacing, note }
}

// ── Overlay signal builder ────────────────────────────────────────────────────

/**
 * Build overlay signals for two-person analysis.
 * Uses active signals from both users to identify the interaction loop.
 */
export function buildOverlaySignals(
  userSignals: ActiveBaselineSignals,
  otherSignals?: Partial<ActiveBaselineSignals>
): OverlaySignals {
  // Default: infer from user signals alone
  if (!otherSignals) {
    return {
      loop: `${userSignals.patternTendency} → response → repeat`,
      amplifier: "The pattern is running without a counterweight.",
      leverage: "Pace and sequence — not content.",
    }
  }

  // Build loop from both sides
  const userPace = userSignals.pace
  const otherPace = otherSignals.pace ?? "unknown"

  let loop = `${userSignals.pressureResponse} meets ${otherSignals.pressureResponse ?? "withdrawal"}`
  let amplifier = "Both sides are responding from their default pattern."
  let leverage = "The leverage is in who moves first and how."

  // Fast + slow = classic pursue/withdraw
  if (userPace === "fast" && otherPace === "slow") {
    loop = "You move toward resolution. They move toward space. The more you push, the more they pull back."
    amplifier = "Your urgency reads as pressure to them. Their space reads as avoidance to you."
    leverage = "Pace. Say the one thing that matters, then stop."
  } else if (userPace === "slow" && otherPace === "fast") {
    loop = "They move fast. You need time. The more they push, the more you shut down."
    amplifier = "Their speed reads as pressure. Your silence reads as disengagement."
    leverage = "Name that you need time. Give a specific window."
  } else if (userPace === "fast" && otherPace === "fast") {
    loop = "Both sides move fast. The conversation escalates before either person has processed."
    amplifier = "Speed without pause creates collision."
    leverage = "One person has to slow down first. It doesn't have to be them."
  }

  return { loop, amplifier, leverage }
}

// ── Rail data builder ─────────────────────────────────────────────────────────

/**
 * Build structured data for the right panel (rail).
 * Quiet, compressed, factual. No framework noise.
 */
export function buildRailData(
  signals: ActiveBaselineSignals,
  timing: TimingSignals,
  signature: BaselineSignature,
  overlay?: OverlaySignals
): RailSectionData {
  return {
    baseline: {
      pace: signals.pace,
      stabilizes: signals.stabilizes,
      pressureResponse: signals.pressureResponse,
      patternTendency: signals.patternTendency,
    },
    sky: {
      urgency: timing.urgency,
      sensitivity: timing.sensitivity,
      tolerance: timing.tolerance,
    },
    pattern: overlay?.loop ?? signals.patternTendency,
    signature: signature.line,
  }
}

// ── Prompt formatter ──────────────────────────────────────────────────────────

/**
 * Format active signals for injection into the AI prompt.
 * This is the only baseline data the AI sees — no raw compute.
 */
export function formatActiveSignalsForPrompt(
  signals: ActiveBaselineSignals,
  timing: TimingSignals,
  overlay?: OverlaySignals
): string {
  const lines: string[] = [
    "BASELINE ACTIVE SIGNALS (internal — do not expose to user):",
    `pace: ${signals.pace}`,
    `stabilizes: ${signals.stabilizes}`,
    `pressure response: ${signals.pressureResponse}`,
    `protects: ${signals.protects}`,
    `pattern tendency: ${signals.patternTendency}`,
  ]

  if (signals.traitLines.length > 0) {
    lines.push("", "Behavioral traits:")
    signals.traitLines.forEach(t => lines.push(`- ${t}`))
  }

  lines.push(
    "",
    "TIMING (internal — do not expose to user):",
    `urgency: ${timing.urgency}`,
    `sensitivity: ${timing.sensitivity}`,
    `tolerance: ${timing.tolerance}`,
    `pacing: ${timing.pacing}`,
  )

  if (timing.note && timing.note !== "No current sky data available." && timing.note !== "Current timing is within normal range.") {
    lines.push(`note: ${timing.note}`)
  }

  if (overlay) {
    lines.push(
      "",
      "OVERLAY (internal — do not expose to user):",
      `loop: ${overlay.loop}`,
      `amplifier: ${overlay.amplifier}`,
      `leverage: ${overlay.leverage}`,
    )
  }

  return lines.join("\n")
}

// ── Export formatter ──────────────────────────────────────────────────────────

/**
 * Build export payload — human-readable, no raw compute.
 */
export function buildExportPayload(
  result: Record<string, unknown>,
  signals: ActiveBaselineSignals,
  timing: TimingSignals,
  signature: BaselineSignature
): ExportPayload {
  const patternSummary = [
    signals.patternTendency,
    signals.pressureResponse,
  ].filter(Boolean).join(" · ")

  const timingState = [
    `urgency: ${timing.urgency}`,
    `sensitivity: ${timing.sensitivity}`,
    `tolerance: ${timing.tolerance}`,
  ].join(" · ")

  return {
    result,
    patternSummary,
    timingState,
    reducedSignals: signals,
    signature: signature.line,
  }
}