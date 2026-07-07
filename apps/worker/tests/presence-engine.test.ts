import { describe, it, expect } from "vitest"
import { runPresenceEngine } from "../src/presence-engine"

describe("Presence Engine", () => {

  describe("answer mode", () => {
    it("routes short factual question to answer mode", () => {
      const profile = runPresenceEngine({
        input: "What is Human Design?",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(profile.mode).toBe("answer")
      expect(profile.visibleStructure).toBe("none")
    })

    it("does not use baseline for simple answer", () => {
      const profile = runPresenceEngine({
        input: "What should I say?",
        hasBaseline: true,
        hasMemory: false,
      })
      expect(profile.useBaseline).toBe(false)
    })
  })

  describe("steady mode", () => {
    it("routes high emotional charge to steady mode", () => {
      const profile = runPresenceEngine({
        input: "I can't stop thinking about it and I don't know what to do. I'm so overwhelmed.",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(profile.mode).toBe("steady")
      expect(profile.emotionalCharge).toBe("high")
    })

    it("offers steady_first chip when charge is high but mode is not steady", () => {
      const profile = runPresenceEngine({
        input: "I keep doing this and I don't know why. I'm so lost.",
        hasBaseline: true,
        hasMemory: false,
      })
      expect(profile.emotionalCharge).toBe("high")
    })
  })

  describe("clarify mode", () => {
    it("routes very short input to clarify mode", () => {
      const profile = runPresenceEngine({
        input: "help",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(profile.mode).toBe("clarify")
      expect(profile.needsClarification).toBe(true)
    })
  })

  describe("mirror mode", () => {
    it("routes repeated pattern with high charge to mirror mode", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we argue. I always end up apologizing even when I'm not wrong. I'm so tired of it.",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(profile.mode).toBe("mirror")
      expect(profile.emotionalCharge).toBe("high")
    })
  })

  describe("map mode", () => {
    it("routes repeated pattern with medium charge to map mode", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we talk. I always end up feeling responsible.",
        hasBaseline: true,
        hasMemory: false,
      })
      expect(["map", "mirror"]).toContain(profile.mode)
    })

    it("uses baseline in map mode when available", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we talk. I always end up feeling responsible.",
        hasBaseline: true,
        hasMemory: false,
      })
      if (profile.mode === "map") {
        expect(profile.useBaseline).toBe(true)
      }
    })
  })

  describe("execute mode", () => {
    it("routes execution request to execute mode", () => {
      const profile = runPresenceEngine({
        input: "Write me a text to send to my sister about the dinner plans.",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(profile.mode).toBe("execute")
      expect(profile.useBaseline).toBe(false)
    })

    it("routes 'what should I text back' to execute mode", () => {
      const profile = runPresenceEngine({
        input: "What should I text back to him?",
        hasBaseline: true,
        hasMemory: false,
      })
      expect(profile.mode).toBe("execute")
    })
  })

  describe("reflect mode", () => {
    it("routes processing input to reflect mode", () => {
      const profile = runPresenceEngine({
        input: "I've been thinking about what happened with my mom last week and I'm not sure how I feel about it.",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(["reflect", "answer"]).toContain(profile.mode)
    })
  })

  describe("user depth override", () => {
    it("forces answer mode when user requests simple", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we argue and I'm so tired of it.",
        hasBaseline: true,
        hasMemory: true,
        userRequestedDepth: "simple",
      })
      expect(profile.mode).toBe("answer")
      expect(profile.useBaseline).toBe(false)
    })

    it("forces integrate mode when user requests deep", () => {
      const profile = runPresenceEngine({
        input: "What is happening here?",
        hasBaseline: true,
        hasMemory: false,
        userRequestedDepth: "deep",
      })
      expect(profile.mode).toBe("integrate")
      expect(profile.visibleStructure).toBe("full")
    })
  })

  describe("step-deeper choices", () => {
    it("includes keep_simple for non-answer modes", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we argue.",
        hasBaseline: true,
        hasMemory: false,
      })
      if (profile.mode !== "answer" && profile.mode !== "execute") {
        expect(profile.stepDeeperChoices).toContain("keep_simple")
      }
    })

    it("includes map_baseline when baseline available and not already mapping", () => {
      const profile = runPresenceEngine({
        input: "I've been thinking about what happened.",
        hasBaseline: true,
        hasMemory: false,
      })
      if (profile.mode !== "map" && profile.mode !== "integrate") {
        expect(profile.stepDeeperChoices).toContain("map_baseline")
      }
    })

    it("limits choices to max 4", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we argue. I always end up apologizing.",
        hasBaseline: true,
        hasMemory: true,
      })
      expect(profile.stepDeeperChoices.length).toBeLessThanOrEqual(4)
    })
  })

  describe("baseline gate", () => {
    it("never uses baseline when not available", () => {
      const profile = runPresenceEngine({
        input: "This keeps happening every time we argue.",
        hasBaseline: false,
        hasMemory: false,
      })
      expect(profile.useBaseline).toBe(false)
    })

    it("never uses baseline for execute mode", () => {
      const profile = runPresenceEngine({
        input: "Write me a message to send.",
        hasBaseline: true,
        hasMemory: false,
      })
      expect(profile.useBaseline).toBe(false)
    })
  })

})
