/**
 * memory.test.ts
 *
 * Tests for:
 * - Pattern signature extraction
 * - Memory context formatting
 * - Privacy: no raw user input stored
 */

import { describe, it, expect } from "vitest"
import {
  extractPatternSignature,
  formatMemoryForPrompt,
  type PatternMemory,
  type MemoryContext,
} from "../src/memory"

describe("extractPatternSignature", () => {
  it("extracts Defrag pattern signature", () => {
    const output = {
      activePattern: "The fixer loop",
      oldRole: "The fixer",
      strainPattern: "Takes on more under pressure",
      alignment: "Name what is yours to do",
    }
    const sig = extractPatternSignature(output, "DEFRAG")
    expect(sig).not.toBeNull()
    expect(sig?.pattern).toBe("The fixer loop")
    expect(sig?.role).toBe("The fixer")
    expect(sig?.space).toBe("DEFRAG")
  })

  it("returns null when activePattern is missing", () => {
    const output = { oldRole: "The fixer" }
    const sig = extractPatternSignature(output, "DEFRAG")
    expect(sig).toBeNull()
  })

  it("extracts Alignment pattern signature", () => {
    const output = {
      theShift: "State what is true, once",
      whatIsTrue: "The situation is ambiguous",
    }
    const sig = extractPatternSignature(output, "ALIGNMENT")
    expect(sig).not.toBeNull()
    expect(sig?.shift).toBe("State what is true, once")
  })

  it("extracts Covenant pattern signature", () => {
    const output = {
      pattern: "Betrayal by someone trusted",
      nextStep: "Bring the grief honestly",
    }
    const sig = extractPatternSignature(output, "COVENANT")
    expect(sig).not.toBeNull()
    expect(sig?.pattern).toBe("Betrayal by someone trusted")
  })

  it("does not include raw user input fields", () => {
    const output = {
      activePattern: "The fixer loop",
      rawUserInput: "My partner said something terrible to me",
      userMessage: "I don't know what to do",
    }
    const sig = extractPatternSignature(output, "DEFRAG")
    // Signature should not contain raw user input fields
    expect(sig).not.toHaveProperty("rawUserInput")
    expect(sig).not.toHaveProperty("userMessage")
  })
})

describe("formatMemoryForPrompt", () => {
  it("returns empty string for no patterns", () => {
    const context: MemoryContext = { recentPatterns: [], sessionCount: 0 }
    expect(formatMemoryForPrompt(context)).toBe("")
  })

  it("includes recurring pattern when present", () => {
    const context: MemoryContext = {
      recentPatterns: [
        {
          id: "1", userId: "u1", space: "DEFRAG",
          pattern: "The fixer loop", role: "The fixer",
          timestamp: new Date().toISOString(), sessionCount: 3,
        } as PatternMemory,
      ],
      recurringPattern: "The fixer loop",
      sessionCount: 3,
    }
    const formatted = formatMemoryForPrompt(context)
    expect(formatted).toContain("The fixer loop")
    expect(formatted).toContain("PATTERN HISTORY")
  })

  it("does not include raw user input in formatted output", () => {
    const context: MemoryContext = {
      recentPatterns: [
        {
          id: "1", userId: "u1", space: "DEFRAG",
          pattern: "The fixer loop",
          timestamp: new Date().toISOString(), sessionCount: 1,
        } as PatternMemory,
      ],
      sessionCount: 1,
    }
    const formatted = formatMemoryForPrompt(context)
    // Should only contain structured pattern data
    expect(formatted).not.toContain("My partner")
    expect(formatted).not.toContain("I don't know")
  })
})
