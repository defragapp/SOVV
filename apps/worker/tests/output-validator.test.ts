/**
 * output-validator.test.ts
 *
 * Tests for:
 * - Schema validation per space
 * - Confidence scoring
 * - Guardrail enforcement
 * - Retry path
 * - Parse safety
 */

import { describe, it, expect } from "vitest"
import {
  validateAndScore,
  buildRetryPrompt,
  parseAIOutput,
} from "../src/output-validator"

// ── parseAIOutput ─────────────────────────────────────────────────────────────

describe("parseAIOutput", () => {
  it("extracts valid JSON from raw text", () => {
    const raw = 'Some preamble {"key": "value"} trailing text'
    const result = parseAIOutput(raw)
    expect(result).toEqual({ key: "value" })
  })

  it("returns null for non-JSON text", () => {
    const result = parseAIOutput("This is not JSON at all")
    expect(result).toBeNull()
  })

  it("handles JSON with nested objects", () => {
    const raw = '{"a": {"b": "c"}, "d": [1, 2]}'
    const result = parseAIOutput(raw)
    expect(result).toEqual({ a: { b: "c" }, d: [1, 2] })
  })

  it("handles empty string", () => {
    expect(parseAIOutput("")).toBeNull()
  })
})

// ── validateAndScore — Defrag ─────────────────────────────────────────────────

describe("validateAndScore — Defrag", () => {
  const validDefragOutput = JSON.stringify({
    summary: "The user is entering a familiar conflict pattern",
    activePattern: "The fixer loop — taking responsibility for what belongs to the other side",
    theRepeat: "The same dynamic keeps forming: one person over-functions, the other withdraws",
    oldRole: "The fixer — the one who holds it together",
    whatYouLearnedToCarry: "Stability was the user's job early on",
    strainPattern: "Under pressure, the user moves faster and takes on more",
    giftUnderStrain: "The user can see what needs to happen before others can",
    alignment: "Name what is yours to do. Do only that.",
    bestNextResponse: { summary: "State the boundary once, clearly", phrasing: ["I can help with X, not Y"] },
    conversationalSteering: { do: ["be specific"], avoid: ["over-explain"] },
  })

  it("validates a complete Defrag output", () => {
    const result = validateAndScore(validDefragOutput, "defrag")
    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
    expect(result.shouldRetry).toBe(false)
  })

  it("scores a high-quality Defrag output", () => {
    const result = validateAndScore(validDefragOutput, "defrag")
    const scoring = result.scoring as { confidence: number; signalStrength: string }
    expect(scoring.confidence).toBeGreaterThan(0.5)
    expect(["medium", "high"]).toContain(scoring.signalStrength)
  })

  it("detects missing required fields", () => {
    const incomplete = JSON.stringify({ summary: "something" })
    const result = validateAndScore(incomplete, "defrag")
    expect(result.valid).toBe(false)
    expect(result.missing).toContain("activePattern")
    expect(result.missing).toContain("alignment")
  })

  it("flags shouldRetry for completely empty output", () => {
    const result = validateAndScore("{}", "defrag")
    expect(result.shouldRetry).toBe(true)
  })

  it("passes guardrails for clean output", () => {
    const result = validateAndScore(validDefragOutput, "defrag")
    expect(result.guardrails.passed).toBe(true)
  })

  it("catches guardrail violations — advice tone", () => {
    const withAdvice = JSON.stringify({
      summary: "test",
      activePattern: "test pattern",
      theRepeat: "test repeat",
      oldRole: "test role",
      alignment: "You should try to communicate better with them",
    })
    const result = validateAndScore(withAdvice, "defrag")
    expect(result.guardrails.passed).toBe(false)
    expect(result.guardrails.violations.length).toBeGreaterThan(0)
  })
})

// ── validateAndScore — Alignment ──────────────────────────────────────────────

describe("validateAndScore — Alignment", () => {
  const validAlignmentOutput = JSON.stringify({
    skyContext: "A response is being asked for before clarity has arrived",
    whatIsTrue: "The situation is more ambiguous than it appears",
    whatIsYours: "Your part is to name what you can and cannot do",
    whatIsNotYours: "Their reaction to the boundary is not yours to manage",
    theShift: "State what is true for you, once, without over-explaining",
    nextStep: "Send the message you have already written",
    avoid: "Do not add qualifications that soften the boundary",
    alignment: "Staying true looks like saying less, not more",
  })

  it("validates a complete Alignment output", () => {
    const result = validateAndScore(validAlignmentOutput, "alignment")
    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it("scores stability correctly", () => {
    const result = validateAndScore(validAlignmentOutput, "alignment")
    const scoring = result.scoring as { stabilityScore: number }
    expect(scoring.stabilityScore).toBeGreaterThan(0.5)
  })

  it("blocks spiritual language in Alignment", () => {
    const withSpiritual = JSON.stringify({
      skyContext: "test",
      whatIsTrue: "Scripture says you should forgive",
      whatIsYours: "test",
      whatIsNotYours: "test",
      theShift: "test",
    })
    const result = validateAndScore(withSpiritual, "alignment")
    expect(result.guardrails.passed).toBe(false)
  })
})

// ── validateAndScore — Covenant ───────────────────────────────────────────────

describe("validateAndScore — Covenant", () => {
  const validCovenantOutput = JSON.stringify({
    figure: "David",
    reference: "Psalms 55",
    pattern: "Betrayal by someone trusted",
    story: "David was betrayed by a close friend and companion. He did not retaliate but brought his grief honestly to God.",
    whatBroke: "The trust that made the relationship feel safe",
    howGodMet: "God was present in the grief — not removing it, but holding it",
    whatTheyLearned: "Honest grief is not faithlessness",
    forYou: "This moment mirrors David's — the betrayal is real, and so is the grief",
    nextStep: "Bring the grief honestly before you decide what to do next",
    scriptures: ["Psalms 55:12-14", "Psalms 55:22"],
    reflectionPrompts: ["What would it mean to bring this honestly?", "What are you protecting by staying silent?"],
  })

  it("validates a complete Covenant output", () => {
    const result = validateAndScore(validCovenantOutput, "covenant")
    expect(result.valid).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it("scores certainty correctly for complete output", () => {
    const result = validateAndScore(validCovenantOutput, "covenant")
    const scoring = result.scoring as { certainty: string }
    expect(["emerging", "stable"]).toContain(scoring.certainty)
  })

  it("blocks condemnation language in Covenant", () => {
    const withCondemnation = JSON.stringify({
      figure: "test",
      story: "God is punishing you for your choices",
      forYou: "test",
      nextStep: "test",
    })
    const result = validateAndScore(withCondemnation, "covenant")
    expect(result.guardrails.passed).toBe(false)
  })

  it("blocks 'God told you' language", () => {
    const withDirective = JSON.stringify({
      figure: "test",
      story: "test story",
      forYou: "God told you to leave this relationship",
      nextStep: "test",
    })
    const result = validateAndScore(withDirective, "covenant")
    expect(result.guardrails.passed).toBe(false)
  })
})

// ── buildRetryPrompt ──────────────────────────────────────────────────────────

describe("buildRetryPrompt", () => {
  it("includes missing field names", () => {
    const prompt = buildRetryPrompt("defrag", ["activePattern", "alignment"])
    expect(prompt).toContain("activePattern")
    expect(prompt).toContain("alignment")
  })

  it("instructs to return JSON only", () => {
    const prompt = buildRetryPrompt("alignment", ["whatIsYours"])
    expect(prompt.toLowerCase()).toContain("json")
  })
})
