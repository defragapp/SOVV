/**
 * presence-engine.ts — Sovereign.os Presence Engine
 *
 * The Presence Engine runs before space execution.
 * It determines the right response mode, overlay, and depth
 * based on what the user actually needs — not what space they're in.
 *
 * Architecture:
 *   Intent Detector
 *   Sufficiency Check
 *   Emotional Charge Detector
 *   Response Profile Router
 *   Baseline Relevance Gate
 *   Space Overlay Selector
 *   Step-Deeper Choice Builder
 */

// ── Core types ────────────────────────────────────────────────────────────────

export type ResponseMode =
  | "answer"     // Direct question, task, fact, simple output
  | "steady"     // Emotional activation, urgency, shame, overwhelm, spiraling
  | "clarify"    // Accuracy requires more context
  | "reflect"    // User is processing, needs to feel seen
  | "mirror"     // Repeated pattern, conflict, hidden relational dynamic
  | "map"        // User needs structure: need, fear, boundary, distortion, next action
  | "integrate"  // Deeper meaning, identity work, generational healing, spiritual lens
  | "execute";   // Concrete artifact: text, plan, prompt, code, action

export type VisibleStructure =
  | "none"       // Conversational, no visible sections
  | "minimal"    // 1-2 key insights only
  | "light"      // 3-4 sections, no heavy framing
  | "structured" // Full output contract with labeled sections
  | "full";      // Complete Defrag/Alignment/Covenant output

export type SpaceOverlay =
  | "none"
  | "defrag"
  | "alignment"
  | "covenant"
  | "baseline";

export type StepDeeperChoice =
  | "keep_simple"
  | "show_pattern"
  | "map_baseline"
  | "turn_into_action"
  | "save_pattern"
  | "go_deeper"
  | "steady_first";

export interface PresenceProfile {
  mode: ResponseMode;
  overlay: SpaceOverlay;
  visibleStructure: VisibleStructure;
  useBaseline: boolean;
  useMemory: boolean;
  needsClarification: boolean;
  canAnswerDirectly: boolean;
  emotionalCharge: "low" | "medium" | "high";
  stepDeeperChoices: StepDeeperChoice[];
  rationale: string;
}

// ── Signal detection ──────────────────────────────────────────────────────────

const EMOTIONAL_ACTIVATION_SIGNALS = [
  /i don'?t know what to do/i,
  /i can'?t (stop|think|breathe|sleep)/i,
  /i'?m (so|really|completely|totally) (lost|overwhelmed|scared|broken|done|exhausted|tired|stuck)/i,
  /i feel like (everything|nothing|i'?m)/i,
  /why (does|do|is|am|can'?t)/i,
  /i keep (doing|saying|feeling|thinking|going back)/i,
  /it'?s (too much|not fair|always|never)/i,
  /i (hate|can'?t stand|am so angry|am furious)/i,
  /please (help|tell me|just)/i,
  /what'?s wrong with me/i,
  /i don'?t understand (why|how|what)/i,
]

const DIRECT_ANSWER_SIGNALS = [
  /^(what|how|when|where|who|which|can you|could you|would you|please|help me)/i,
  /^(write|draft|create|make|build|generate|give me|show me|list|summarize)/i,
  /^(what should i (say|text|write|do|respond))/i,
  /^(is it|are they|does this|should i)/i,
]

const PATTERN_SIGNALS = [
  /every time/i,
  /always (does|says|happens|ends up)/i,
  /keeps (happening|doing|saying|coming back)/i,
  /same (thing|pattern|fight|argument|dynamic)/i,
  /again and again/i,
  /this (always|never|keeps)/i,
  /we (always|never|keep)/i,
  /i (always|never|keep) (end up|do|say|feel)/i,
]

const EXECUTION_SIGNALS = [
  /^(write|draft|create|make|build|generate|code|deploy|send|post)/i,
  /what (should|can|do) i (say|text|write|send|respond)/i,
  /help me (write|draft|respond|reply|say)/i,
  /give me (a|the|some) (text|message|email|response|reply|plan|script)/i,
]

const SPIRITUAL_SIGNALS = [
  /god|faith|prayer|scripture|bible|covenant|meaning|purpose|calling/i,
  /why (is|did|would) god/i,
  /what (does|is) (god|faith|scripture)/i,
]

const CLARIFICATION_NEEDED_SIGNALS = [
  /^.{0,20}$/,  // Very short input (under 20 chars)
]

// ── Emotional charge detection ────────────────────────────────────────────────

function detectEmotionalCharge(input: string): "low" | "medium" | "high" {
  const highCount = EMOTIONAL_ACTIVATION_SIGNALS.filter(p => p.test(input)).length
  const hasPattern = PATTERN_SIGNALS.some(p => p.test(input))
  if (highCount >= 2) return "high"
  if (highCount === 1) return hasPattern ? "high" : "medium"

  // A clearly repeated loop carries meaningful charge even when the user
  // describes it calmly. Route it to mapping instead of flattening it into
  // a generic reflection.
  if (hasPattern) return "medium"

  // Check for urgency markers
  const urgencyMarkers = /(!{2,}|\?{2,}|help|urgent|now|please|asap)/i
  if (urgencyMarkers.test(input)) return "medium"

  return "low"
}

// ── Intent detection ──────────────────────────────────────────────────────────

function detectIntent(input: string): {
  isDirectQuestion: boolean
  isExecution: boolean
  hasPattern: boolean
  needsSteadying: boolean
  isSpiritual: boolean
  needsClarification: boolean
} {
  const trimmed = input.trim()

  return {
    isDirectQuestion: DIRECT_ANSWER_SIGNALS.some(p => p.test(trimmed)),
    isExecution: EXECUTION_SIGNALS.some(p => p.test(trimmed)),
    hasPattern: PATTERN_SIGNALS.some(p => p.test(trimmed)),
    needsSteadying: EMOTIONAL_ACTIVATION_SIGNALS.filter(p => p.test(trimmed)).length >= 2,
    isSpiritual: SPIRITUAL_SIGNALS.some(p => p.test(trimmed)),
    needsClarification: trimmed.length < 15 && !DIRECT_ANSWER_SIGNALS.some(p => p.test(trimmed)),
  }
}

// ── Sufficiency check ─────────────────────────────────────────────────────────

function checkSufficiency(input: string, hasBaseline: boolean): {
  canAnswerDirectly: boolean
  needsClarification: boolean
} {
  const wordCount = input.trim().split(/\s+/).length

  // Too short to work with meaningfully
  if (wordCount < 4) {
    return { canAnswerDirectly: false, needsClarification: true }
  }

  // Direct questions can always be answered
  if (DIRECT_ANSWER_SIGNALS.some(p => p.test(input))) {
    return { canAnswerDirectly: true, needsClarification: false }
  }

  // Execution requests can always be answered
  if (EXECUTION_SIGNALS.some(p => p.test(input))) {
    return { canAnswerDirectly: true, needsClarification: false }
  }

  return { canAnswerDirectly: true, needsClarification: false }
}

// ── Baseline relevance gate ───────────────────────────────────────────────────

function shouldUseBaseline(
  input: string,
  hasBaseline: boolean,
  mode: ResponseMode,
  emotionalCharge: "low" | "medium" | "high"
): boolean {
  if (!hasBaseline) return false

  // Never use baseline for pure execution or clarification
  if (mode === "execute" || mode === "clarify") return false

  // Always use baseline for map and integrate
  if (mode === "map" || mode === "integrate") return true

  // Use baseline for mirror when charge is medium/high
  if (mode === "mirror" && emotionalCharge !== "low") return true

  // Use baseline for steady when charge is high
  if (mode === "steady" && emotionalCharge === "high") return true

  // Use baseline for reflect when input is relational
  if (mode === "reflect" && /\b(he|she|they|we|us|him|her|them|my|our)\b/i.test(input)) return true

  // Don't use baseline for simple answers
  if (mode === "answer") return false

  return false
}

// ── Space overlay selector ────────────────────────────────────────────────────

function selectSpaceOverlay(
  mode: ResponseMode,
  isSpiritual: boolean,
  hasPattern: boolean,
  currentSpace: string
): SpaceOverlay {
  // Respect explicit space selection
  if (currentSpace === "covenant") return "covenant"
  if (currentSpace === "alignment") return "alignment"

  // Spiritual content → Covenant overlay
  if (isSpiritual && (mode === "integrate" || mode === "map")) return "covenant"

  // Pattern + map mode → Defrag overlay
  if (hasPattern && mode === "map") return "defrag"

  // Integration → Defrag overlay
  if (mode === "integrate") return "defrag"

  // Mirror → Defrag overlay
  if (mode === "mirror") return "defrag"

  return "none"
}

// ── Step-deeper choice builder ────────────────────────────────────────────────

function buildStepDeeperChoices(
  mode: ResponseMode,
  hasPattern: boolean,
  hasBaseline: boolean,
  emotionalCharge: "low" | "medium" | "high"
): StepDeeperChoice[] {
  const choices: StepDeeperChoice[] = []

  // Always offer "keep simple" unless already in simple mode
  if (mode !== "answer" && mode !== "execute") {
    choices.push("keep_simple")
  }

  // Offer pattern if not already mirroring/mapping
  if (hasPattern && mode !== "mirror" && mode !== "map") {
    choices.push("show_pattern")
  }

  // Offer baseline mapping if available and not already using it
  if (hasBaseline && mode !== "map" && mode !== "integrate") {
    choices.push("map_baseline")
  }

  // Offer action for reflective modes
  if (mode === "reflect" || mode === "mirror" || mode === "map") {
    choices.push("turn_into_action")
  }

  // Offer save for pattern modes
  if (mode === "mirror" || mode === "map" || mode === "integrate") {
    choices.push("save_pattern")
  }

  // Offer steadying if charge is high
  if (emotionalCharge === "high" && mode !== "steady") {
    choices.unshift("steady_first")
  }

  return choices.slice(0, 4) // Max 4 choices
}

// ── Main Presence Engine ──────────────────────────────────────────────────────

export function runPresenceEngine(opts: {
  input: string
  hasBaseline: boolean
  hasMemory: boolean
  currentSpace?: string
  userRequestedDepth?: "simple" | "deep" | null
}): PresenceProfile {
  const { input, hasBaseline, hasMemory, currentSpace = "defrag", userRequestedDepth } = opts

  // User explicitly requested simple → answer mode
  if (userRequestedDepth === "simple") {
    return {
      mode: "answer",
      overlay: "none",
      visibleStructure: "minimal",
      useBaseline: false,
      useMemory: false,
      needsClarification: false,
      canAnswerDirectly: true,
      emotionalCharge: "low",
      stepDeeperChoices: ["show_pattern", "map_baseline"],
      rationale: "User requested simple response.",
    }
  }

  // User explicitly requested deep → integrate mode
  if (userRequestedDepth === "deep") {
    return {
      mode: "integrate",
      overlay: selectSpaceOverlay("integrate", false, true, currentSpace),
      visibleStructure: "full",
      useBaseline: hasBaseline,
      useMemory: hasMemory,
      needsClarification: false,
      canAnswerDirectly: true,
      emotionalCharge: detectEmotionalCharge(input),
      stepDeeperChoices: ["keep_simple", "save_pattern"],
      rationale: "User requested deeper integration.",
    }
  }

  const emotionalCharge = detectEmotionalCharge(input)
  const intent = detectIntent(input)
  const sufficiency = checkSufficiency(input, hasBaseline)

  // Determine response mode
  let mode: ResponseMode

  if (sufficiency.needsClarification) {
    mode = "clarify"
  } else if (intent.needsSteadying) {
    mode = "steady"
  } else if (intent.isExecution) {
    mode = "execute"
  } else if (intent.isDirectQuestion && !intent.hasPattern && emotionalCharge === "low") {
    mode = "answer"
  } else if (intent.hasPattern && emotionalCharge === "high") {
    mode = "mirror"
  } else if (intent.hasPattern && emotionalCharge === "medium") {
    mode = "map"
  } else if (intent.hasPattern) {
    mode = "reflect"
  } else if (intent.isSpiritual) {
    mode = "integrate"
  } else if (emotionalCharge === "high") {
    mode = "steady"
  } else if (emotionalCharge === "medium") {
    mode = "reflect"
  } else {
    mode = "answer"
  }

  const useBaseline = shouldUseBaseline(input, hasBaseline, mode, emotionalCharge)
  const overlay = selectSpaceOverlay(mode, intent.isSpiritual, intent.hasPattern, currentSpace)

  // Determine visible structure
  let visibleStructure: VisibleStructure
  if (mode === "answer" || mode === "steady" || mode === "clarify") {
    visibleStructure = "none"
  } else if (mode === "reflect" || mode === "execute") {
    visibleStructure = "minimal"
  } else if (mode === "mirror") {
    visibleStructure = "light"
  } else if (mode === "map") {
    visibleStructure = "structured"
  } else {
    visibleStructure = "full"
  }

  const stepDeeperChoices = buildStepDeeperChoices(mode, intent.hasPattern, hasBaseline, emotionalCharge)

  const rationale = [
    `Mode: ${mode}`,
    emotionalCharge !== "low" ? `Charge: ${emotionalCharge}` : null,
    intent.hasPattern ? "Pattern detected" : null,
    intent.isExecution ? "Execution request" : null,
    useBaseline ? "Baseline active" : null,
    overlay !== "none" ? `Overlay: ${overlay}` : null,
  ].filter(Boolean).join(" · ")

  return {
    mode,
    overlay,
    visibleStructure,
    useBaseline,
    useMemory: hasMemory && mode !== "answer" && mode !== "execute",
    needsClarification: sufficiency.needsClarification,
    canAnswerDirectly: sufficiency.canAnswerDirectly,
    emotionalCharge,
    stepDeeperChoices,
    rationale,
  }
}

// ── Mode overlay prompts ──────────────────────────────────────────────────────

export const MODE_OVERLAYS: Record<ResponseMode, string> = {
  answer: `
RESPONSE MODE: ANSWER
Give the clean, direct answer. Do not add unnecessary analysis or interpretation.
If the question is factual, answer it. If it requires a recommendation, give one clearly.
Do not therapize. Do not pattern-map unless the user asks.
`,
  steady: `
RESPONSE MODE: STEADY
The user is activated. Regulate the moment before analyzing it.
Use calm, grounded language. Do not diagnose or interpret.
Acknowledge what is happening in plain human terms.
Offer one clear, small next step.
Do not force structure. Do not go deep unless invited.
`,
  clarify: `
RESPONSE MODE: CLARIFY
You need more context to answer accurately.
Ask one necessary question — not multiple.
Or provide the best partial answer with stated assumptions.
Keep it brief and warm.
`,
  reflect: `
RESPONSE MODE: REFLECT
The user is processing. They need to feel seen before they need to be helped.
Name what is happening in plain human language.
Do not force a framework. Do not rush to solutions.
One observation. One question if useful.
`,
  mirror: `
RESPONSE MODE: MIRROR
A repeated pattern or relational dynamic is present.
Name the pattern clearly and without shame.
Show the loop: what one person does, what it triggers in the other.
Do not take sides. Do not diagnose.
`,
  map: `
RESPONSE MODE: MAP
The user needs structure to understand what is happening.
Use Baseline Design where it helps — not as a template, as a lens.
Map: what is active, what is theirs to carry, what is not, what the leverage point is.
One clear next move at the end.
`,
  integrate: `
RESPONSE MODE: INTEGRATE
The user is asking for deeper meaning or identity-level work.
Connect the present moment to pattern, timing, relational history, or symbolic layer.
Preserve user agency. Do not claim certainty.
Use Baseline Design as the primary lens.
`,
  execute: `
RESPONSE MODE: EXECUTE
The user wants a finished output: text, message, plan, code, or action.
Produce it cleanly. Do not add unnecessary analysis.
If context is needed, state assumptions briefly first.
`,
}

// ── Step-deeper chip labels ───────────────────────────────────────────────────

export const STEP_DEEPER_LABELS: Record<StepDeeperChoice, string> = {
  keep_simple: "Keep it simple",
  show_pattern: "Show the deeper pattern",
  map_baseline: "Map with Baseline Design",
  turn_into_action: "Turn this into action",
  save_pattern: "Save this pattern",
  go_deeper: "Go deeper",
  steady_first: "Steady first",
}
