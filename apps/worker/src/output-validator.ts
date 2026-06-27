// @ts-nocheck
/**
 * output-validator.ts
 *
 * Tasks:
 * 1. Output validation — schema check + retry on invalid
 * 2. Confidence + signal scoring per space
 * 6. Guardrails — prevent overreach per space
 *
 * This module is the quality gate between AI output and the user.
 */

// ── Required fields per space ─────────────────────────────────────────────────
const DEFRAG_REQUIRED = ["summary", "activePattern", "theRepeat", "oldRole", "alignment"] as const
const ALIGNMENT_REQUIRED = ["whatIsTrue", "whatIsYours", "whatIsNotYours", "theShift", "nextStep"] as const
const COVENANT_REQUIRED = ["figure", "story", "forYou", "nextStep"] as const

// ── Guardrail patterns — blocked phrases per space ────────────────────────────
// These prevent spaces from drifting into each other's territory

const DEFRAG_BLOCKED_PATTERNS = [
  /you should/i,
  /i recommend/i,
  /my advice/i,
  /you need to/i,
  /you must/i,
  /you have to/i,
  /try to/i,
  /consider doing/i,
]

const ALIGNMENT_BLOCKED_PATTERNS = [
  /god is telling/i,
  /scripture says/i,
  /the bible/i,
  /spiritually/i,
  /you are called/i,
  /your purpose/i,
  // Alignment should not give lists
]

const COVENANT_BLOCKED_PATTERNS = [
  /god told you/i,
  /god is punishing/i,
  /you are being tested/i,
  /this is a sign/i,
  /god wants you to/i,
  /you must repent/i,
  /you are sinning/i,
  /condemnation/i,
]

// ── Confidence scoring ────────────────────────────────────────────────────────

export type SignalStrength = "low" | "medium" | "high"
export type CertaintyLevel = "open" | "emerging" | "stable"

export interface DefragScoring {
  confidence: number  // 0-1
  signalStrength: SignalStrength
}

export interface AlignmentScoring {
  confidence: number  // 0-1
  stabilityScore: number  // 0-1
}

export interface CovenantScoring {
  confidence: number  // 0-1
  certainty: CertaintyLevel
}

function scoreDefrag(output: Record<string, unknown>): DefragScoring {
  let score = 0
  let signals = 0

  // Score based on field completeness and specificity
  if (output.activePattern && typeof output.activePattern === "string" && output.activePattern.length > 20) { score += 0.2; signals++ }
  if (output.theRepeat && typeof output.theRepeat === "string" && output.theRepeat.length > 20) { score += 0.15; signals++ }
  if (output.oldRole && typeof output.oldRole === "string" && output.oldRole.length > 10) { score += 0.15; signals++ }
  if (output.strainPattern && typeof output.strainPattern === "string") { score += 0.1; signals++ }
  if (output.alignment && typeof output.alignment === "string" && output.alignment.length > 20) { score += 0.2; signals++ }
  if (output.bestNextResponse && typeof output.bestNextResponse === "object") { score += 0.2; signals++ }

  const signalStrength: SignalStrength = signals >= 5 ? "high" : signals >= 3 ? "medium" : "low"
  return { confidence: Math.min(score, 1), signalStrength }
}

function scoreAlignment(output: Record<string, unknown>): AlignmentScoring {
  let score = 0
  let stability = 0

  if (output.whatIsTrue && typeof output.whatIsTrue === "string" && output.whatIsTrue.length > 20) { score += 0.2; stability += 0.2 }
  if (output.whatIsYours && typeof output.whatIsYours === "string" && output.whatIsYours.length > 15) { score += 0.2; stability += 0.3 }
  if (output.whatIsNotYours && typeof output.whatIsNotYours === "string") { score += 0.15; stability += 0.2 }
  if (output.theShift && typeof output.theShift === "string" && output.theShift.length > 20) { score += 0.25; stability += 0.3 }
  if (output.nextStep && typeof output.nextStep === "string" && output.nextStep.length > 10) { score += 0.2 }

  return { confidence: Math.min(score, 1), stabilityScore: Math.min(stability, 1) }
}

function scoreCovenant(output: Record<string, unknown>): CovenantScoring {
  let score = 0

  if (output.figure && typeof output.figure === "string") score += 0.15
  if (output.story && typeof output.story === "string" && output.story.length > 30) score += 0.2
  if (output.howGodMet && typeof output.howGodMet === "string" && output.howGodMet.length > 20) score += 0.2
  if (output.forYou && typeof output.forYou === "string" && output.forYou.length > 30) score += 0.25
  if (output.nextStep && typeof output.nextStep === "string" && output.nextStep.length > 10) score += 0.2

  const certainty: CertaintyLevel = score >= 0.8 ? "stable" : score >= 0.5 ? "emerging" : "open"
  return { confidence: Math.min(score, 1), certainty }
}

// ── Guardrail check ───────────────────────────────────────────────────────────

function checkGuardrails(
  output: Record<string, unknown>,
  space: "defrag" | "alignment" | "covenant"
): { passed: boolean; violations: string[] } {
  const violations: string[] = []
  const text = JSON.stringify(output).toLowerCase()

  const patterns = space === "defrag" ? DEFRAG_BLOCKED_PATTERNS
    : space === "alignment" ? ALIGNMENT_BLOCKED_PATTERNS
    : COVENANT_BLOCKED_PATTERNS

  for (const pattern of patterns) {
    if (pattern.test(text)) {
      violations.push(pattern.source)
    }
  }

  return { passed: violations.length === 0, violations }
}

// ── Schema validation ─────────────────────────────────────────────────────────

function validateSchema(
  output: Record<string, unknown>,
  space: "defrag" | "alignment" | "covenant"
): { valid: boolean; missing: string[] } {
  const required = space === "defrag" ? DEFRAG_REQUIRED
    : space === "alignment" ? ALIGNMENT_REQUIRED
    : COVENANT_REQUIRED

  const missing = (required as readonly string[]).filter(field => !output[field] || output[field] === "")
  return { valid: missing.length === 0, missing }
}

// ── Parse AI output safely ────────────────────────────────────────────────────

export function parseAIOutput(rawText: string): Record<string, unknown> | null {
  const trimmed = rawText.trim()
  const match = trimmed.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0]) as Record<string, unknown>
  } catch {
    return null
  }
}

// ── Main validation + scoring function ───────────────────────────────────────

export interface ValidationResult {
  valid: boolean
  output: Record<string, unknown>
  scoring: DefragScoring | AlignmentScoring | CovenantScoring
  guardrails: { passed: boolean; violations: string[] }
  missing: string[]
  shouldRetry: boolean
}

export function validateAndScore(
  rawText: string,
  space: "defrag" | "alignment" | "covenant"
): ValidationResult {
  const output = parseAIOutput(rawText) || {}

  const schema = validateSchema(output, space)
  const guardrails = checkGuardrails(output, space)

  const scoring = space === "defrag" ? scoreDefrag(output)
    : space === "alignment" ? scoreAlignment(output)
    : scoreCovenant(output)

  // Retry if schema is invalid (missing required fields)
  // Don't retry for guardrail violations — log and continue
  const shouldRetry = !schema.valid && Object.keys(output).length === 0

  // Add scoring to output
  const enrichedOutput = {
    ...output,
    _meta: {
      space,
      scoring,
      guardrailsPassed: guardrails.passed,
      confidence: (scoring as Record<string, unknown>).confidence,
    },
  }

  // Log guardrail violations (never block — just log)
  if (!guardrails.passed) {
    console.warn(JSON.stringify({
      event: "guardrail_violation",
      space,
      violations: guardrails.violations,
      timestamp: new Date().toISOString(),
    }))
  }

  return {
    valid: schema.valid,
    output: enrichedOutput,
    scoring,
    guardrails,
    missing: schema.missing,
    shouldRetry,
  }
}

// ── Retry prompt builder ──────────────────────────────────────────────────────

export function buildRetryPrompt(space: "defrag" | "alignment" | "covenant", missing: string[]): string {
  return `Your previous output was missing required fields: ${missing.join(", ")}.

Return the complete JSON output with ALL required fields filled in.
Do not include any explanation — return only valid JSON.
Every field must have a non-empty string value.`
}
