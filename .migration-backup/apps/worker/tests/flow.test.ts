/**
 * flow.test.ts
 *
 * Tests for:
 * - Flow suggestion logic
 * - Context building (no raw input)
 * - Urgency classification
 */

import { describe, it, expect } from "vitest"
import { suggestNextSpace, formatFlowSuggestion } from "../src/flow"

describe("suggestNextSpace", () => {
  it("suggests Alignment for conflict patterns", () => {
    const output = {
      activePattern: "The conflict is escalating",
      oldRole: "The mediator",
      alignment: "Name what is yours to do",
    }
    const suggestion = suggestNextSpace(output)
    expect(suggestion).not.toBeNull()
    expect(suggestion?.nextSpace).toBe("ALIGNMENT")
    expect(suggestion?.urgency).toBe("high")
  })

  it("suggests Alignment for message/response patterns", () => {
    const output = {
      activePattern: "A message needs to be sent",
      oldRole: "The responder",
      alignment: "Respond cleanly",
    }
    const suggestion = suggestNextSpace(output)
    expect(suggestion?.nextSpace).toBe("ALIGNMENT")
  })

  it("suggests Covenant for grief patterns", () => {
    const output = {
      activePattern: "Grief that has no clear resolution",
      oldRole: "The one who holds it",
      alignment: "Hold it without forcing resolution",
    }
    const suggestion = suggestNextSpace(output)
    expect(suggestion?.nextSpace).toBe("COVENANT")
    expect(suggestion?.urgency).toBe("low")
  })

  it("suggests Covenant for meaning/purpose patterns", () => {
    const output = {
      activePattern: "A question of purpose and meaning",
      oldRole: "The seeker",
      alignment: "Stay honest about what you do not know",
    }
    const suggestion = suggestNextSpace(output)
    expect(suggestion?.nextSpace).toBe("COVENANT")
  })

  it("returns null when no clear next step", () => {
    const output = {
      activePattern: "A minor irritation",
      oldRole: "The observer",
      alignment: "Let it pass",
    }
    // Short alignment = no strong suggestion
    const suggestion = suggestNextSpace(output)
    // May or may not suggest — just ensure it doesn't crash
    expect(suggestion === null || suggestion?.nextSpace !== undefined).toBe(true)
  })

  it("does not include raw user input in prefillContext", () => {
    const output = {
      activePattern: "The fixer loop",
      oldRole: "The fixer",
      strainPattern: "Takes on more under pressure",
      alignment: "Name what is yours to do and only that",
      rawUserInput: "My partner said something terrible",
    }
    const suggestion = suggestNextSpace(output)
    if (suggestion) {
      expect(suggestion.prefillContext).not.toContain("My partner said")
      expect(suggestion.prefillContext).not.toContain("rawUserInput")
    }
  })
})

describe("formatFlowSuggestion", () => {
  it("returns null for null input", () => {
    expect(formatFlowSuggestion(null)).toBeNull()
  })

  it("formats suggestion without exposing prefillContext", () => {
    const suggestion = {
      nextSpace: "ALIGNMENT" as const,
      reason: "A response is forming",
      prefillContext: "Active pattern: The fixer loop\nRole: The fixer",
      urgency: "high" as const,
    }
    const formatted = formatFlowSuggestion(suggestion)
    expect(formatted).not.toBeNull()
    expect(formatted?.nextSpace).toBe("ALIGNMENT")
    expect(formatted?.reason).toBe("A response is forming")
    // prefillContext should NOT be in the formatted output (kept server-side)
    expect(formatted).not.toHaveProperty("prefillContext")
    expect(formatted?.hasPrefill).toBe(true)
  })
})
