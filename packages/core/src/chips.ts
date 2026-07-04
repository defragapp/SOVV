import type { Mode } from "./types.js";

export const CHIP_GROUPS: Record<Mode, Array<{ title: string; chips: string[] }>> = {
  self: [
    {
      title: "Alignment & Pattern",
      chips: [
        "Am I in alignment right now?",
        "Why does this moment feel so intense?",
        "Why do I keep reacting this way?",
        "What’s the real story here?"
      ]
    },
    {
      title: "Architecture & Blind Spots",
      chips: [
        "Why does this keep happening to me?",
        "What am I not seeing about myself?",
        "What’s the meaning of this moment?",
        "What steadies me right now?"
      ]
    }
  ],
  situation: [
    {
      title: "Orientation",
      chips: [
        "What do I do now?",
        "What’s the bigger picture I’m not seeing?",
        "What is true beneath the noise?",
        "What lowers the pressure here?"
      ]
    }
  ],
  pair: [
    {
      title: "Relational Intelligence",
      chips: [
        "What’s actually happening between us?",
        "What am I not seeing about them?",
        "How might this feel from their side?",
        "What is the moment trying to resolve?"
      ]
    }
  ],
  group: [
    {
      title: "The Dynamic",
      chips: [
        "What roles are people reenacting here?",
        "What Chapter are we actually in?",
        "What is the real story beneath the noise?",
        "What steadies the group right now?"
      ]
    }
  ]
};

export function flatChips(mode: Mode): string[] {
  return (CHIP_GROUPS[mode] ?? CHIP_GROUPS.self).flatMap((g) => g.chips);
}
