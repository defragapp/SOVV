import type { Mode } from "./types.js";

export const CHIP_GROUPS: Record<Mode, Array<{ title: string; chips: string[] }>> = {
  self: [
    {
      title: "Steadier self",
      chips: [
        "What does steady look like for me in conflict?",
        "What helps me respond without over-explaining?",
        "What boundary sentence fits me?"
      ]
    },
    {
      title: "Unhelpful patterns",
      chips: [
        "What do I do that escalates things without meaning to?",
        "What do I do when I feel cornered?",
        "What am I protecting when I get intense?"
      ]
    },
    {
      title: "Family patterns",
      chips: [
        "What role did I learn to play growing up?",
        "Where did I learn to carry too much?",
        "What keeps repeating across different people?"
      ]
    },
    {
      title: "How I land on others",
      chips: [
        "How might people experience me when I’m stressed?",
        "What do others misunderstand about my intent?",
        "Where might I be trying to control because I feel unsafe?"
      ]
    }
  ],
  situation: [
    {
      title: "Next message",
      chips: [
        "Rewrite my message so it stays honest and calm",
        "What should I say next in one sentence?",
        "What should I stop saying right now?"
      ]
    },
    {
      title: "Clarity",
      chips: [
        "What is most likely true vs assumed?",
        "What’s the simplest explanation that fits the facts?",
        "What detail would change this the most if I knew it?"
      ]
    },
    {
      title: "Repair",
      chips: [
        "What is a clean repair line here?",
        "What should I apologize for (if anything)?",
        "What should I not apologize for?"
      ]
    }
  ],
  pair: [
    {
      title: "From the other side",
      chips: [
        "How might they experience me in this moment?",
        "What might feel threatening to them, even if I didn’t mean it?",
        "What might they be trying to protect right now?"
      ]
    },
    {
      title: "Better conversation",
      chips: [
        "Give me one sentence that is clear and not harsh",
        "What would calm this down fastest?",
        "What’s one boundary that reduces conflict?"
      ]
    },
    {
      title: "Repair",
      chips: [
        "What is a clean repair line from my side?",
        "What is a clean repair line from their side?",
        "What should we agree on so this doesn’t repeat?"
      ]
    }
  ],
  group: [
    {
      title: "Group pattern",
      chips: [
        "What roles are people falling into here?",
        "Who is carrying too much?",
        "What keeps getting avoided instead of addressed?"
      ]
    },
    {
      title: "Stabilize",
      chips: [
        "What would stabilize this group fastest?",
        "What is one simple rule that reduces conflict?",
        "What is one conversation that needs to happen directly?"
      ]
    }
  ]
};

export function flatChips(mode: Mode): string[] {
  return (CHIP_GROUPS[mode] ?? CHIP_GROUPS.self).flatMap((g) => g.chips);
}
