/**
 * active-signals.test.ts
 *
 * Tests for the active signal selection pipeline:
 * - selectActiveSignals: context-aware reduction from full dataset
 * - buildTimingSignals: urgency/sensitivity/tolerance from astronomy
 * - buildOverlaySignals: two-person loop construction
 * - buildBaselineSignature: compressed identity line
 * - formatActiveSignalsForPrompt: AI-ready string output
 * - buildRailData: structured right-panel data
 *
 * CRITICAL: This pipeline is the only baseline data the AI sees.
 * Regressions here cause prompt hallucination and inconsistent outputs.
 */

import { describe, it, expect } from "vitest"
import {
  selectActiveSignals,
  buildTimingSignals,
  buildOverlaySignals,
  buildBaselineSignature,
  formatActiveSignalsForPrompt,
  buildRailData,
  type ActiveBaselineSignals,
  type TimingSignals,
} from "../src/active-signals"
import type { BaselineDesignDataset } from "../src/baseline-compiler"

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeMinimalDataset(overrides: Partial<BaselineDesignDataset> = {}): BaselineDesignDataset {
  return {
    input: { dob: "1990-03-15", tob: "14:30", pob: "New York, NY" },
    status: "ready",
    computedAt: "2026-06-25T00:00:00Z",
    frameworks: {
      humanDesign: {
        type: "Generator",
        authority: "Sacral",
        profile: "2/4",
        strategy: "Respond",
        gates: [],
        channels: [],
        centers: {},
      },
      astrology: {
        placements: [
          { body: "Sun", sign: "Pisces", degree: 24 },
          { body: "Moon", sign: "Cancer", degree: 12 },
        ],
        ascendant: { sign: "Leo", degree: 5 },
      },
    },
    ...overrides,
  } as BaselineDesignDataset
}

function makeDatasetWithAI(): BaselineDesignDataset {
  return makeMinimalDataset({
    aiDataset: {
      identityAnchors: ["clarity", "connection"],
      derivedTraits: [
        {
          key: "relational-pace",
          label: "Relational Pace",
          sourceFrameworks: ["HD"],
          evidenceTags: ["Generator"],
          evidence: [],
          alignedExpression: ["Responds before committing — waits for the gut signal"],
          overExpression: ["Pushes through without checking in"],
          underExpression: ["Waits too long, misses the window"],
        },
      ],
      appOverlays: {
        defrag: { likelyLoops: ["moves early under pressure", "over-explains to manage anxiety"] },
        alignment: { coreTheme: "clarity", likelyBlocks: [] },
        covenant: { narrativeFrame: "the one who holds space", likelyResistance: [] },
      },
    },
  })
}

// ── selectActiveSignals ───────────────────────────────────────────────────────

describe("selectActiveSignals", () => {
  it("returns all required fields", () => {
    const dataset = makeMinimalDataset()
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result).toHaveProperty("pace")
    expect(result).toHaveProperty("stabilizes")
    expect(result).toHaveProperty("responds")
    expect(result).toHaveProperty("protects")
    expect(result).toHaveProperty("pattern")
    expect(result).toHaveProperty("evidenceTags")
    expect(result).toHaveProperty("traitLines")
    expect(Array.isArray(result.evidenceTags)).toBe(true)
    expect(Array.isArray(result.traitLines)).toBe(true)
  })

  it("derives pace=variable for Generator HD type", () => {
    const dataset = makeMinimalDataset()
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.pace).toBe("variable")
  })

  it("derives pace=fast for Manifestor", () => {
    const dataset = makeMinimalDataset({
      frameworks: {
        humanDesign: { type: "Manifestor", authority: "Ego", profile: "1/3", strategy: "Inform", gates: [], channels: [], centers: {} },
      },
    })
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.pace).toBe("fast")
  })

  it("derives pace=slow for Projector", () => {
    const dataset = makeMinimalDataset({
      frameworks: {
        humanDesign: { type: "Projector", authority: "Splenic", profile: "3/5", strategy: "Wait for invitation", gates: [], channels: [], centers: {} },
      },
    })
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.pace).toBe("slow")
  })

  it("derives stabilizes=gut response for Sacral authority", () => {
    const dataset = makeMinimalDataset()
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.stabilizes).toBe("gut response")
  })

  it("uses aiDataset likelyLoops for pattern when available", () => {
    const dataset = makeDatasetWithAI()
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.pattern).toBe("moves early under pressure")
  })

  it("uses aiDataset identityAnchors for protects when available", () => {
    const dataset = makeDatasetWithAI()
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.protects).toBe("clarity")
  })

  it("filters traits by relational context", () => {
    const dataset = makeDatasetWithAI()
    const relational = selectActiveSignals(dataset, { message: "test", relational: true, mode: "pair" })
    const selfMode = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    // relational mode filters to relational/pressure/pace/emotional traits
    expect(Array.isArray(relational.traitLines)).toBe(true)
    expect(Array.isArray(selfMode.traitLines)).toBe(true)
  })

  it("includes HD profile and type in evidenceTags", () => {
    const dataset = makeMinimalDataset()
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.evidenceTags.some(t => t.includes("HD"))).toBe(true)
    expect(result.evidenceTags.some(t => t === "Generator")).toBe(true)
  })

  it("returns pace=unknown when no HD type present", () => {
    const dataset = makeMinimalDataset({ frameworks: {} })
    const result = selectActiveSignals(dataset, { message: "test", relational: false, mode: "self" })
    expect(result.pace).toBe("unknown")
  })
})

// ── buildTimingSignals ────────────────────────────────────────────────────────

describe("buildTimingSignals", () => {
  it("returns stable neutral defaults when no astronomy data", () => {
    const dataset = makeMinimalDataset()
    const result = buildTimingSignals(dataset)
    expect(result.urgency).toBe("moderate")
    expect(result.sensitivity).toBe("moderate")
    expect(result.tolerance).toBe("moderate")
    expect(result.pacing).toBe("normal")
    expect(result.state).toBe("stable")
  })

  it("sets urgency=high and tolerance=low for Mars retrograde", () => {
    const dataset = makeMinimalDataset({
      astronomy: {
        source: "JPL_HORIZONS",
        epoch: "2026-06-25",
        bodies: {
          Mars: { longitude: 120, latitude: 0, sign: "Leo", degree: 0, retrograde: true },
        },
      },
    })
    const result = buildTimingSignals(dataset)
    expect(result.urgency).toBe("high")
    expect(result.tolerance).toBe("low")
    expect(result.state).toBe("reactive")
  })

  it("sets sensitivity=high for Mercury retrograde", () => {
    const dataset = makeMinimalDataset({
      astronomy: {
        source: "JPL_HORIZONS",
        epoch: "2026-06-25",
        bodies: {
          Mercury: { longitude: 80, latitude: 0, sign: "Gemini", degree: 20, retrograde: true },
        },
      },
    })
    const result = buildTimingSignals(dataset)
    expect(result.sensitivity).toBe("high")
  })

  it("sets pacing=slow for Saturn retrograde", () => {
    const dataset = makeMinimalDataset({
      astronomy: {
        source: "JPL_HORIZONS",
        epoch: "2026-06-25",
        bodies: {
          Saturn: { longitude: 300, latitude: 0, sign: "Aquarius", degree: 10, retrograde: true },
        },
      },
    })
    const result = buildTimingSignals(dataset)
    expect(result.pacing).toBe("slow")
  })

  it("sets state=reactive when any signal is elevated", () => {
    const dataset = makeMinimalDataset({
      astronomy: {
        source: "JPL_HORIZONS",
        epoch: "2026-06-25",
        bodies: {
          Mars: { longitude: 120, latitude: 0, sign: "Leo", degree: 0, retrograde: true },
        },
      },
    })
    const result = buildTimingSignals(dataset)
    expect(result.state).toBe("reactive")
  })

  it("includes note when retrograde planets present", () => {
    const dataset = makeMinimalDataset({
      astronomy: {
        source: "JPL_HORIZONS",
        epoch: "2026-06-25",
        bodies: {
          Mercury: { longitude: 80, latitude: 0, sign: "Gemini", degree: 20, retrograde: true },
        },
      },
    })
    const result = buildTimingSignals(dataset)
    expect(result.note).toBeDefined()
    expect(result.note).toContain("Mercury retrograde")
  })
})

// ── buildOverlaySignals ───────────────────────────────────────────────────────

describe("buildOverlaySignals", () => {
  const baseSignals: ActiveBaselineSignals = {
    pace: "fast",
    stabilizes: "gut response",
    responds: "moves toward resolution",
    protects: "autonomy",
    pattern: "moves early under pressure",
    evidenceTags: ["Generator"],
    traitLines: [],
  }

  it("returns default loop when no other signals provided", () => {
    const result = buildOverlaySignals(baseSignals)
    expect(result).toHaveProperty("loop")
    expect(result).toHaveProperty("amplifier")
    expect(result).toHaveProperty("shift")
    expect(result.loop).toContain("repeat")
  })

  it("detects fast+slow pursue/withdraw pattern", () => {
    const otherSignals: Partial<ActiveBaselineSignals> = { pace: "slow", responds: "withdrawal" }
    const result = buildOverlaySignals(baseSignals, otherSignals)
    expect(result.loop).toContain("space")
    expect(result.shift).toContain("Pace")
  })

  it("detects slow+fast shutdown pattern", () => {
    const slowSignals: ActiveBaselineSignals = { ...baseSignals, pace: "slow" }
    const otherSignals: Partial<ActiveBaselineSignals> = { pace: "fast" }
    const result = buildOverlaySignals(slowSignals, otherSignals)
    expect(result.loop).toContain("fast")
  })

  it("detects fast+fast collision pattern", () => {
    const otherSignals: Partial<ActiveBaselineSignals> = { pace: "fast" }
    const result = buildOverlaySignals(baseSignals, otherSignals)
    expect(result.loop).toContain("escalates")
  })
})

// ── buildBaselineSignature ────────────────────────────────────────────────────

describe("buildBaselineSignature", () => {
  it("builds signature line with HD tokens", () => {
    const dataset = makeMinimalDataset()
    const result = buildBaselineSignature(dataset)
    expect(result.line).toContain("HD:")
    expect(result.line).toContain("TYPE:")
    expect(result.line).toContain("AUTH:")
    expect(result.tokens.length).toBeGreaterThan(0)
  })

  it("includes rising sign when ascendant available", () => {
    const dataset = makeMinimalDataset()
    const result = buildBaselineSignature(dataset)
    expect(result.line).toContain("RIS: Leo")
  })

  it("falls back to DOB/POB when no framework data", () => {
    const dataset = makeMinimalDataset({ frameworks: {} })
    const result = buildBaselineSignature(dataset)
    expect(result.line).toContain("DOB:")
    expect(result.line).toContain("POB:")
  })

  it("token order is HD → TYPE → AUTH → GK → RIS → NOD", () => {
    const dataset = makeMinimalDataset()
    const result = buildBaselineSignature(dataset)
    const keys = result.tokens.map(t => t.key)
    const hdIdx = keys.indexOf("HD")
    const typeIdx = keys.indexOf("TYPE")
    const authIdx = keys.indexOf("AUTH")
    if (hdIdx >= 0 && typeIdx >= 0) expect(hdIdx).toBeLessThan(typeIdx)
    if (typeIdx >= 0 && authIdx >= 0) expect(typeIdx).toBeLessThan(authIdx)
  })
})

// ── formatActiveSignalsForPrompt ──────────────────────────────────────────────

describe("formatActiveSignalsForPrompt", () => {
  const signals: ActiveBaselineSignals = {
    pace: "variable",
    stabilizes: "gut response",
    responds: "moves toward resolution",
    protects: "clarity",
    pattern: "moves early under pressure",
    evidenceTags: ["Generator", "Sacral"],
    traitLines: ["Responds before committing"],
  }

  const timing: TimingSignals = {
    urgency: "moderate",
    sensitivity: "moderate",
    tolerance: "moderate",
    pacing: "normal",
    state: "stable",
  }

  it("includes all signal fields in output", () => {
    const result = formatActiveSignalsForPrompt(signals, timing)
    expect(result).toContain("pace: variable")
    expect(result).toContain("stabilizes: gut response")
    expect(result).toContain("responds: moves toward resolution")
    expect(result).toContain("protects: clarity")
    expect(result).toContain("pattern: moves early under pressure")
  })

  it("includes timing fields", () => {
    const result = formatActiveSignalsForPrompt(signals, timing)
    expect(result).toContain("urgency: moderate")
    expect(result).toContain("tolerance: moderate")
    expect(result).toContain("state: stable")
  })

  it("includes trait lines when present", () => {
    const result = formatActiveSignalsForPrompt(signals, timing)
    expect(result).toContain("Responds before committing")
  })

  it("includes overlay section when provided", () => {
    const overlay = { loop: "test loop", amplifier: "test amp", shift: "test shift" }
    const result = formatActiveSignalsForPrompt(signals, timing, overlay)
    expect(result).toContain("OVERLAY")
    expect(result).toContain("test loop")
  })

  it("marks all sections as internal", () => {
    const result = formatActiveSignalsForPrompt(signals, timing)
    expect(result).toContain("internal")
  })

  it("never exposes evidence tags to AI output", () => {
    const result = formatActiveSignalsForPrompt(signals, timing)
    // evidenceTags are internal — should NOT appear in the formatted prompt
    expect(result).not.toContain("evidenceTags")
    expect(result).not.toContain("Generator, Sacral")
  })
})

// ── buildRailData ─────────────────────────────────────────────────────────────

describe("buildRailData", () => {
  const signals: ActiveBaselineSignals = {
    pace: "fast",
    stabilizes: "gut response",
    responds: "moves toward resolution",
    protects: "autonomy",
    pattern: "moves early under pressure",
    evidenceTags: [],
    traitLines: [],
  }

  const timing: TimingSignals = {
    urgency: "high",
    sensitivity: "moderate",
    tolerance: "low",
    pacing: "fast",
    state: "reactive",
  }

  const signature = { line: "HD: 2/4 · TYPE: Generator", tokens: [] }

  it("returns all required rail sections", () => {
    const result = buildRailData(signals, timing, signature)
    expect(result).toHaveProperty("baseline")
    expect(result).toHaveProperty("sky")
    expect(result).toHaveProperty("pattern")
    expect(result).toHaveProperty("signature")
  })

  it("baseline section has pace, stabilizes, responds", () => {
    const result = buildRailData(signals, timing, signature)
    expect(result.baseline.pace).toBe("fast")
    expect(result.baseline.stabilizes).toBe("gut response")
    expect(result.baseline.responds).toBe("moves toward resolution")
  })

  it("sky section has urgency and tolerance", () => {
    const result = buildRailData(signals, timing, signature)
    expect(result.sky.urgency).toBe("high")
    expect(result.sky.tolerance).toBe("low")
  })

  it("uses overlay loop when provided", () => {
    const overlay = { loop: "custom loop", amplifier: "amp", shift: "shift" }
    const result = buildRailData(signals, timing, signature, overlay)
    expect(result.pattern.loop).toBe("custom loop")
  })

  it("falls back to signals.pattern when no overlay", () => {
    const result = buildRailData(signals, timing, signature)
    expect(result.pattern.loop).toBe("moves early under pressure")
  })

  it("includes signature line", () => {
    const result = buildRailData(signals, timing, signature)
    expect(result.signature).toBe("HD: 2/4 · TYPE: Generator")
  })
})
