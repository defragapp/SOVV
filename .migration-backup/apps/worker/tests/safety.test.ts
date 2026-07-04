import { describe, it, expect } from "vitest";
import { safetyMode, supportResponse, RISK_WORDS } from "../src/safety";

describe("Safety Module", () => {
  describe("safetyMode()", () => {
    it("detects all RISK_WORDS", () => {
      RISK_WORDS.forEach((word) => {
        const testCases = [
          `I ${word} myself`,
          `I want to ${word}`,
          `${word.toUpperCase()} NOW`,
        ];
        testCases.forEach((testCase) => {
          expect(safetyMode(testCase)).toBe("support");
        });
      });
    });

    it("handles false positives gracefully", () => {
      // The implementation does simple substring matching - these should trigger
      const triggeredMessages = [
        "I abuse alcohol but seeking help", // Contains "abuse"
        "violence in video games", // Contains "violence"
      ];

      // These should NOT trigger
      const safMessages = [
        "I had a safe checkpoint", // Contains neither "safe" nor "unsafe"
        "I'm learning security modeling", // Doesn't contain any risk words
      ];

      triggeredMessages.forEach((msg) => {
        expect(safetyMode(msg)).toBe("support");
      });

      safMessages.forEach((msg) => {
        expect(safetyMode(msg)).toBe("normal");
      });
    });

    it("handles unicode and encoding", () => {
      const unicodeCases = [
        { input: "I want to diē", expected: "normal" }, // Accented char (not "die")
        { input: "I 💔 want to die", expected: "support" }, // Emoji + real text
        { input: "kill myself", expected: "support" }, // Basic case
        { input: "KILL MYSELF", expected: "support" }, // Uppercase
      ];

      unicodeCases.forEach(({ input, expected }) => {
        expect(safetyMode(input)).toBe(expected);
      });
    });

    it("handles null/undefined safely", () => {
      expect(safetyMode(null as any)).toBe("normal");
      expect(safetyMode(undefined as any)).toBe("normal");
      expect(safetyMode("")).toBe("normal");
      expect(safetyMode("   ")).toBe("normal"); // Whitespace only
    });

    it("is case-insensitive", () => {
      const caseVariations = [
        "KILL MYSELF",
        "kill myself",
        "KiLl MySelF",
        "kIlL mYsElF",
      ];

      caseVariations.forEach((variation) => {
        expect(safetyMode(variation)).toBe("support");
      });
    });

    it("preserves message for logging", () => {
      const sensitiveMessage = "I want to kill myself";
      // safetyMode should not modify the input
      expect(safetyMode(sensitiveMessage)).toBe("support");
    });

    it("handles multiple risk words in one message", () => {
      expect(safetyMode("I want to kill myself and hurt others")).toBe(
        "support"
      );
      expect(
        safetyMode("This situation is abusive and a threat to my safety")
      ).toBe("support");
    });

    it("returns 'normal' for safe messages", () => {
      const safeMessages = [
        "I'm having a great day!",
        "Let me tell you about my work",
        "How can I improve my protocols?",
        "The weather is beautiful today",
        "I love spending time with my family",
      ];

      safeMessages.forEach((msg) => {
        expect(safetyMode(msg)).toBe("normal");
      });
    });
  });

  describe("supportResponse()", () => {
    it("returns valid support response object", () => {
      const response = supportResponse();
      expect(response).toHaveProperty("message");
      expect(response).toHaveProperty("resources");
      expect(typeof response.message).toBe("string");
      expect(Array.isArray(response.resources)).toBe(true);
    });

    it("includes crisis resources", () => {
      const response = supportResponse();
      const resourceLabels = response.resources.map((r: any) => r.label);

      // Check for key resources
      expect(resourceLabels.some((l: string) => l.includes("988"))).toBe(true);
      expect(resourceLabels.join(",")).toMatch(/lifeline|crisis|help|emergency|danger/i);
    });

    it("includes contact information in resources", () => {
      const response = supportResponse();
      response.resources.forEach((resource: any) => {
        expect(resource).toHaveProperty("label");
        expect(resource).toHaveProperty("link");
        expect(typeof resource.label).toBe("string");
        expect(typeof resource.link).toBe("string");
      });
    });

    it("provides accessible message", () => {
      const response = supportResponse();
      expect(response.message.length).toBeGreaterThan(0);
      expect(response.message.toLowerCase()).toMatch(
        /support|help|resources|available/i
      );
    });
  });

  describe("RISK_WORDS constant", () => {
    it("is a non-empty array", () => {
      expect(Array.isArray(RISK_WORDS)).toBe(true);
      expect(RISK_WORDS.length).toBeGreaterThan(0);
    });

    it("contains only strings", () => {
      RISK_WORDS.forEach((word) => {
        expect(typeof word).toBe("string");
        expect(word.length).toBeGreaterThan(0);
      });
    });

    it("contains known crisis keywords", () => {
      const knownKeywords = [
        "suicide",
        "kill",
        "hurt",
        "harm",
        "die",
        "self harm",
      ];

      knownKeywords.forEach((keyword) => {
        const found = RISK_WORDS.some((w) => w.includes(keyword));
        expect(found).toBe(true);
      });
    });
  });

  describe("Integration: Safety + Response Flow", () => {
    it("completes support flow correctly", () => {
      const userMessage = "I want to hurt myself";
      const mode = safetyMode(userMessage);
      const response = supportResponse();

      expect(mode).toBe("support");
      expect(response).toHaveProperty("message");
      expect(response.resources.length).toBeGreaterThan(0);
    });

    it("handles normal message flow", () => {
      const userMessage = "Tell me about pattern recognition";
      const mode = safetyMode(userMessage);

      expect(mode).toBe("normal");
      // Normal messages don't trigger supportResponse() in real code
    });
  });
});
