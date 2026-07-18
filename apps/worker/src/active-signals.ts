/**
 * active-signals.ts â Baseline Active Signal Selection System
 *
 * Pipeline:
 *   BaselineDesignDataset (full compute, server-side only)
 *   â selectActiveSignals()          â context-aware reduction
 *   â buildBaselineSignature()       â compressed identity line
 *   â buildTimingSignals()           â urgency/sensitivity/tolerance
 *   â buildOverlaySignals()          â two-person loop construction
 *   â buildRailData()                â structured right-panel data
 *   â formatActiveSignalsForPrompt() â AI-ready context string
 *
 * CRITICAL SYSTEM RULE:
 * Full baseline compute is never used directly in prompts or UI.
 * All reasoning must pass through the active signal selection layer.
 * If this rule breaks, the system will drift back into framework dumping,
 * prompt hallucination, and inconsistent outputs.
 *
 * Signature line format (token order is locked):
 *   HD: 5/1 Â· TYPE: Generator Â· AUTH: Sacral Â· GK: 13/33 Â· RIS: Leo Â· NOD: 2/8
 *   Order: HD â TYPE â AUTH â GK â RIS â NOD
 */

import type { BaselineDesignDataset } from "./baseline-compiler.js"

// Types defined locally to avoid circular dependency with @sovereign/core
// These match the interfaces in packages/core/src/types.ts
export type ActiveBaselineSignals = {
  pace: "fast" | "slow" | "variable" | "unknown"
  stabilizes: string
  responds: string
  protects: string
  pattern: string
  evidenceTags: string[]
  traitLines: string[]
}

export type TimingSignals = {
  urgency: "low" | "moderate" | "high"
  sensitivity: "low" | "moderate" | "high"
  tolerance: "low" | "moderate" | "high"
  pacing: "slow" | "normal" | "fast"
  state: "stable" | "reactive"
  note?: string
}

export type OverlaySignals = {
  loop: string
  amplifier: string
  shift: string
}

// ââ Types âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/** Compressed identity signature â shown once, bottom of result surface */
export interface BaselineSignature {
  /** Encoded one-line signature: "HD: 5/1 Â· TYPE: Generator Â· AUTH: Sacral Â· GK: 13/33 Â· RIS: Leo Â· NOD: 2/8" */
  line: string
  /** Individual tokens for structured rendering */
  tokens: Array<{ key: string; value: string }>
}



/** Default rail data â quiet, compressed, factual.
 *  Max 3 baseline signals. No raw framework data. */
export interface RailSectionData {
  baseline: {
    pace: string
    stabilizes: string
    responds: string
  }
  sky: {
    urgency: string
    tolerance: string
    state?: string
  }
  pattern: {
    loop: string
  }
  signature: string
}

/** Export payload â human-readable, no raw compute */
export interface ExportPayload {
  result: Record<string, unknown>
  patternSummary: string
  timingState: string
  reducedSignals: ActiveBaselineSignals
  signature: string
}

// ââ Signature builder âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Build the compressed identity signature line from the full compute.
 * Format: HD: 5/1 Â· TYPE: Generator Â· AUTH: Sacral Â· GK: 13/33 Â· RIS: Leo Â· NOD: 2/8
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

  // Gene Keys â primary activation (first activation, sphere if available)
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

  // Nodal axis â north node sign if available
  const northNode = ast?.placements?.find(p => p.body === "NorthNode" || p.body === "True Node")
  if (northNode?.sign) {
    tokens.push({ key: "NOD", value: northNode.sign })
  }

  // Fallback: use DOB if no framework data computed yet
  if (tokens.length === 0) {
    tokens.push({ key: "DOB", value: dataset.input.dob })
    tokens.push({ key: "POB", value: dataset.input.pob })
  }

  const line = tokens.map(t => `${t.key}: ${t.value}`).join(" Â· ")

  return { line, tokens }
}

// ââ Active signal selector ââââââââââââââââââââââââââââââââââââââââââââââââââââ

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

  // ââ Pace: derived from HD type + authority ââââââââââââââââââââââââââââââââ
  let pace: ActiveBaselineSignals["pace"] = "unknown"
  if (hd?.type) {
    const fastTypes = ["Manifestor", "Manifesting Generator"]
    const slowTypes = ["Projector", "Reflector"]
    if (fastTypes.some(t => hd.type?.includes(t))) pace = "fast"
    else if (slowTypes.some(t => hd.type?.includes(t))) pace = "slow"
    else pace = "variable" // Generator
  }

  // ââ Stabilizes: what brings them back to center âââââââââââââââââââââââââââ
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

  // ââ Pressure response: from derived traits if available âââââââââââââââââââ
  let responds = "moves toward resolution"
  if (aiData?.derivedTraits?.length) {
    const pressureTrait = aiData.derivedTraits.find(t =>
      t.key.includes("pressure") || t.key.includes("strain") || t.key.includes("pace")
    )
    if (pressureTrait?.overExpression?.[0]) {
      responds = pressureTrait.overExpression[0]
    }
  }

  // ââ Protects: from identity anchors or sun sign âââââââââââââââââââââââââââ
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

  // ââ Pattern tendency: from appOverlays.defrag âââââââââââââââââââââââââââââ
  let pattern = "moves early under pressure"
  if (aiData?.appOverlays?.defrag?.likelyLoops?.length) {
    pattern = aiData.appOverlays.defrag.likelyLoops[0]
  }

  // ââ Evidence tags (internal, not shown to user) âââââââââââââââââââââââââââ
  // ââ Cross-framework synthesis âââââââââââââââââââââââââââââââââââââââââââââââââ
  // Compound signals from multiple frameworks produce stronger behavioral insights
  const gk = dataset.frameworks?.geneKeys

  const traitLines: string[] = []
  // HD type + Moon sign compound
  if (hd?.type && ast?.placements) {
    const moon = ast.placements.find(p => p.body === "Moon")
    if (moon) {
      const waterMoon = ["Pisces", "Cancer", "Scorpio"].includes(moon.sign)
      const fireMoon = ["Aries", "Leo", "Sagittarius"].includes(moon.sign)
      const isProjector = hd.type?.includes("Projector")
      const isManifestar = hd.type?.includes("Manifestor") || hd.type?.includes("Manifesting")
      if (isProjector && waterMoon && !traitLines.some(t => t.includes("absorb"))) {
        traitLines.push("Absorbs others' emotional states â needs recognition before acting")
      }
      if (isManifestar && fireMoon && !traitLines.some(t => t.includes("initiat"))) {
        traitLines.push("Initiates quickly under pressure â others may not be ready")
      }
    }
  }

  // Gate 51 (shock/initiation) + Aries sun compound
  if (hd?.gates && ast?.placements) {
    const hasGate51 = (hd.gates as any[]).some((g: any) => g.gate === 51)
    const sun = ast.placements.find(p => p.body === "Sun")
    if (hasGate51 && sun?.sign === "Aries" && !traitLines.some(t => t.includes("shock"))) {
      traitLines.push("Moves first under shock â initiates before others have processed")
    }
  }

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

  // ââ Trait lines: human-readable for AI context ââââââââââââââââââââââââââââ
  if (aiData?.derivedTraits?.length) {
    // Select top 3 most relevant traits based on context
    // Relevance gate: keep valid Baseline signals only when they can change
    // the current interpretation or next move. Avoid adding context by default.
    const messageContext = context.message.toLowerCase()
    const relevanceScore = (trait: { key: string; alignedExpression?: string[] }) => {
      let score = 0
      if (context.relational && trait.key.includes("relational")) score += 2
      if (trait.key.includes("pressure") || trait.key.includes("strain")) score += 2
      if (trait.key.includes("pace") || trait.key.includes("emotional")) score += 1

      const keywords = messageContext.split(/\s+/).filter(Boolean)
      if (keywords.some(word => trait.key.toLowerCase().includes(word))) score += 2
      if (keywords.some(word => trait.alignedExpression?.join(" ").toLowerCase().includes(word))) score += 1

      return score
    }

    const relevantTraits = aiData.derivedTraits
      .map(trait => ({ trait, score: relevanceScore(trait) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ trait }) => trait)

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
    responds,
    protects,
    pattern,
    evidenceTags,
    traitLines,
  }
}

// ââ Timing signal mapper ââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Derive timing signals from CURRENT sky context (live transits).
 * Uses live sky snapshot if available; falls back to neutral defaults.
 * Timing explains activation, not fate.
 *
 * @param dataset - User's natal baseline dataset
 * @param liveSky - Current planetary positions (fetched live, not natal)
 */
export function buildTimingSignals(
  dataset: BaselineDesignDataset,
  liveSky?: { bodies: Record<string, { sign: string; degree: number; retrograde: boolean }> } | null
): TimingSignals {
  // Use live sky if available, otherwise fall back to neutral
  const skyData = liveSky ?? dataset.astronomy
  if (!skyData) {
    return {
      urgency: "moderate",
      sensitivity: "moderate",
      tolerance: "moderate",
      pacing: "normal",
      state: "stable",
    }
  }

  const bodies = skyData.bodies
  let urgency: TimingSignals["urgency"] = "moderate"
  let sensitivity: TimingSignals["sensitivity"] = "moderate"
  let tolerance: TimingSignals["tolerance"] = "moderate"
  let pacing: TimingSignals["pacing"] = "normal"
  const notes: string[] = []

  // Mars retrograde â lower tolerance, higher urgency
  if (bodies["Mars"]?.retrograde) {
    urgency = "high"
    tolerance = "low"
    notes.push("Mars retrograde â urgency is higher than usual, tolerance is lower")
  }

  // Mercury retrograde â communication sensitivity up
  if (bodies["Mercury"]?.retrograde) {
    sensitivity = "high"
    notes.push("Mercury retrograde â communication lands differently right now")
  }

  // Saturn retrograde â pacing slows, pressure to review
  if (bodies["Saturn"]?.retrograde) {
    pacing = "slow"
    notes.push("Saturn retrograde â things are moving slower than they feel")
  }

  // Venus retrograde â relational sensitivity high
  if (bodies["Venus"]?.retrograde) {
    sensitivity = "high"
    notes.push("Venus retrograde â relational dynamics are more charged than usual")
  }

  // ââ Transit-based timing signals âââââââââââââââââââââââââââââââââââââââââââââ
  // Check planetary positions for high-pressure configurations
  // Saturn in Capricorn/Aquarius â structural pressure, accountability
  if (bodies["Saturn"]?.sign && ["Capricorn", "Aquarius"].includes(bodies["Saturn"].sign)) {
    if (tolerance !== "low") tolerance = "low"
    notes.push("Saturn in " + bodies["Saturn"].sign + " â structural pressure, accountability active")
  }

  // Mars in Aries/Scorpio â high action energy, lower patience
  if (bodies["Mars"]?.sign && ["Aries", "Scorpio"].includes(bodies["Mars"].sign)) {
    if (urgency !== "high") urgency = "moderate"
    notes.push("Mars in " + bodies["Mars"].sign + " â action energy high, patience lower")
  }

  // Moon in water signs â emotional sensitivity elevated
  if (bodies["Moon"]?.sign && ["Pisces", "Cancer", "Scorpio"].includes(bodies["Moon"].sign)) {
    if (sensitivity !== "high") sensitivity = "high"
    notes.push("Moon in " + bodies["Moon"].sign + " â emotional sensitivity elevated")
  }

  // Jupiter in fire signs â expansion, optimism, may move too fast
  if (bodies["Jupiter"]?.sign && ["Aries", "Leo", "Sagittarius"].includes(bodies["Jupiter"].sign)) {
    if (pacing !== "slow") pacing = "fast"
    notes.push("Jupiter in " + bodies["Jupiter"].sign + " â expansion energy, may move faster than usual")
  }

  // Derive state: reactive if any signal is elevated
  const state: TimingSignals["state"] =
    urgency === "high" || tolerance === "low" || sensitivity === "high"
      ? "reactive"
      : "stable"

  const note = notes.length > 0 ? notes.join(". ") : undefined

  return { urgency, sensitivity, tolerance, pacing, state, note }
}

// ââ Overlay signal builder ââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
      loop: `${userSignals.pattern} â response â repeat`,
      amplifier: "The pattern is running without a counterweight.",
      shift: "Pace and sequence â not content.",
    }
  }

  // Build loop from both sides
  const userPace = userSignals.pace
  const otherPace = otherSignals.pace ?? "unknown"

  let loop = `${userSignals.responds} meets ${otherSignals.responds ?? "withdrawal"}`
  let amplifier = "Both sides are responding from their default pattern."
  let shift = "Who moves first and how."

  // Fast + slow = classic pursue/withdraw
  if (userPace === "fast" && otherPace === "slow") {
    loop = "You move toward resolution. They move toward space. The more you push, the more they pull back."
    amplifier = "Your urgency reads as pressure to them. Their space reads as avoidance to you."
    shift = "Pace. Say the one thing that matters, then stop."
  } else if (userPace === "slow" && otherPace === "fast") {
    loop = "They move fast. You need time. The more they push, the more you shut down."
    amplifier = "Their speed reads as pressure. Your silence reads as disengagement."
    shift = "Name that you need time. Give a specific window."
  } else if (userPace === "fast" && otherPace === "fast") {
    loop = "Both sides move fast. The conversation escalates before either person has processed."
    amplifier = "Speed without pause creates collision."
    shift = "One person has to slow down first. It doesn't have to be them."
  }

  return { loop, amplifier, shift }
}

// ââ Rail data builder âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

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
      responds: signals.responds,
      // pattern: signals.pattern,
    },
    sky: {
      urgency: timing.urgency,
      state: timing.sensitivity,
      tolerance: timing.tolerance,
    },
    pattern: { loop: overlay?.loop ?? signals.pattern ?? "" },
    signature: signature.line,
  }
}

// ââ Prompt formatter ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Format active signals for injection into the AI prompt.
 * This is the only baseline data the AI sees â no raw compute.
 */
export function formatActiveSignalsForPrompt(
  signals: ActiveBaselineSignals,
  timing: TimingSignals,
  overlay?: OverlaySignals
): string {
  const lines: string[] = [
    "BASELINE ACTIVE SIGNALS (internal â do not expose to user):",
    `pace: ${signals.pace}`,
    `stabilizes: ${signals.stabilizes}`,
    `responds: ${signals.responds}`,
    `protects: ${signals.protects}`,
    `pattern: ${signals.pattern}`,
  ]

  if (signals.traitLines.length > 0) {
    lines.push("", "Behavioral traits:")
    signals.traitLines.forEach(t => lines.push(`- ${t}`))
  }

  lines.push(
    "",
    "CURRENT SKY TIMING (use to explain why this moment feels amplified â do not expose raw values):",
    `urgency: ${timing.urgency}`,
    `sensitivity: ${timing.sensitivity}`,
    `tolerance: ${timing.tolerance}`,
    `state: ${timing.state}`,
  )

  if (timing.note) {
    // Translate raw sky conditions into behavioral language only
    // Never expose framework terms (planet names, retrograde) to the AI
    const behavioralNote = timing.note
      .replace(/Mars retrograde[^.â]*/gi, "heightened urgency and lower tolerance")
      .replace(/Mercury retrograde[^.â]*/gi, "communication sensitivity elevated")
      .replace(/Saturn retrograde[^.â]*/gi, "slower pacing, pressure to review")
      .replace(/Venus retrograde[^.â]*/gi, "relational dynamics more charged")
      .replace(/Saturn in [A-Za-z]+[^.â]*/gi, "structural pressure active")
      .replace(/Mars in [A-Za-z]+[^.â]*/gi, "action energy elevated")
      .replace(/Moon in [A-Za-z]+[^.â]*/gi, "emotional sensitivity elevated")
      .replace(/Jupiter in [A-Za-z]+[^.â]*/gi, "expansion energy, faster pacing")
      .replace(/[A-Z][a-z]+ (retrograde|in [A-Z][a-z]+)[^.â]*/g, "timing pressure active")
      .trim()
    if (behavioralNote) {
      lines.push(`current timing: ${behavioralNote}`)
    }
  }

  if (overlay) {
    lines.push(
      "",
      "OVERLAY (internal â do not expose to user):",
      `loop: ${overlay.loop}`,
      `amplifier: ${overlay.amplifier}`,
      `shift: ${overlay.shift}`,
    )
  }

  return lines.join("\n")
}

// ââ Export formatter ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

/**
 * Build export payload â human-readable, no raw compute.
 */
export function buildExportPayload(
  result: Record<string, unknown>,
  signals: ActiveBaselineSignals,
  timing: TimingSignals,
  signature: BaselineSignature
): ExportPayload {
  const patternSummary = [
    signals.pattern,
    signals.responds,
  ].filter(Boolean).join(" Â· ")

  const timingState = [
    `urgency: ${timing.urgency}`,
    `sensitivity: ${timing.sensitivity}`,
    `tolerance: ${timing.tolerance}`,
  ].join(" Â· ")

  return {
    result,
    patternSummary,
    timingState,
    reducedSignals: signals,
    signature: signature.line,
  }
}