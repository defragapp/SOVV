// packages/core/src/geneKeyMeanings.ts

export interface GeneKeyMeaning {
  key: number;
  theme: string;
  shadow: string;
  gift: string;
}

// v1: keep it lightweight but sharp
export const GENE_KEY_MEANINGS: Record<number, GeneKeyMeaning> = {
  1: { key: 1, theme: "Creativity", shadow: "Entropy", gift: "Fresh expression" },
  2: { key: 2, theme: "Direction", shadow: "Dislocation", gift: "Inner guidance" },
  3: { key: 3, theme: "Change", shadow: "Chaos", gift: "Innovation" },
  4: { key: 4, theme: "Understanding", shadow: "Intolerance", gift: "Clarity" },
  5: { key: 5, theme: "Patience", shadow: "Impatience", gift: "Timing" },

  10: { key: 10, theme: "Self", shadow: "Self-obsession", gift: "Natural being" },
  13: { key: 13, theme: "Listening", shadow: "Discord", gift: "Empathy" },
  14: { key: 14, theme: "Power", shadow: "Compromise", gift: "Competence" },
  15: { key: 15, theme: "Magnetism", shadow: "Dullness", gift: "Humanity" },

  20: { key: 20, theme: "Presence", shadow: "Superficiality", gift: "Awareness" },
  23: { key: 23, theme: "Expression", shadow: "Complexity", gift: "Simplicity" },
  24: { key: 24, theme: "Return", shadow: "Addiction", gift: "Invention" },

  27: { key: 27, theme: "Caring", shadow: "Selfishness", gift: "Altruism" },
  28: { key: 28, theme: "Purpose", shadow: "Purposelessness", gift: "Totality" },

  34: { key: 34, theme: "Force", shadow: "Forcefulness", gift: "Strength" },
  36: { key: 36, theme: "Emotion", shadow: "Turbulence", gift: "Humanity" },

  40: { key: 40, theme: "Will", shadow: "Exhaustion", gift: "Resolve" },
  42: { key: 42, theme: "Growth", shadow: "Expectation", gift: "Completion" },

  48: { key: 48, theme: "Depth", shadow: "Inadequacy", gift: "Wisdom" },
  50: { key: 50, theme: "Values", shadow: "Corruption", gift: "Equilibrium" },

  57: { key: 57, theme: "Intuition", shadow: "Unease", gift: "Clarity" },
  58: { key: 58, theme: "Joy", shadow: "Dissatisfaction", gift: "Vitality" },

  64: { key: 64, theme: "Imagination", shadow: "Confusion", gift: "Vision" },
};
