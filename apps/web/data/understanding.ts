export type UnderstandingGoalId =
  | "myself"
  | "someone_else"
  | "relationship"
  | "situation"
  | "next_move"

export type JourneyStageId = "experience" | "understanding" | "action" | "learning"

export interface HumanQuestion {
  readonly id: string
  readonly goal: UnderstandingGoalId
  readonly question: string
  readonly example: string
}

export interface JourneyStage {
  readonly id: JourneyStageId
  readonly label: string
  readonly description: string
}

export interface ProductSpace {
  readonly name: string
  readonly href: string
  readonly question: string
  readonly description: string
  readonly tier: "Free" | "Pro"
}

export const journeyStages: readonly JourneyStage[] = [
  {
    id: "experience",
    label: "Experience",
    description: "Bring the raw moment: the fight, silence, reaction, pressure, or decision.",
  },
  {
    id: "understanding",
    label: "Understanding",
    description: "Sovereign separates what happened from the pattern, context, and meaning underneath it.",
  },
  {
    id: "action",
    label: "Action",
    description: "Leave with the cleanest next move: words, timing, repair, boundary, or pause.",
  },
  {
    id: "learning",
    label: "Learning",
    description: "Every useful insight becomes reusable context for future clarity.",
  },
] as const

export const humanQuestions: readonly HumanQuestion[] = [
  {
    id: "react-this-way",
    goal: "myself",
    question: "Why do I keep reacting this way?",
    example: "Understand the baseline tendency, pressure state, and pattern that shape your reaction.",
  },
  {
    id: "they-pulled-away",
    goal: "someone_else",
    question: "Why did they pull away?",
    example: "Separate silence, protection, timing, and possible emotional load before assuming intent.",
  },
  {
    id: "same-fight",
    goal: "relationship",
    question: "Why do we keep having the same fight?",
    example: "Map the loop, role activation, escalation point, and repair pathway between you.",
  },
  {
    id: "what-happened",
    goal: "situation",
    question: "What just happened?",
    example: "Turn the confusing moment into a structured read of pressure, meaning, and timing.",
  },
  {
    id: "what-next",
    goal: "next_move",
    question: "What should I do next?",
    example: "Choose the response, pause, boundary, or repair that reduces pressure instead of feeding it.",
  },
] as const

export const productJourney: readonly ProductSpace[] = [
  {
    name: "Baseline",
    href: "/app/login",
    question: "Who am I?",
    description: "Build the personal model that helps Sovereign understand how you perceive, regulate, communicate, and repeat patterns.",
    tier: "Free",
  },
  {
    name: "Defrag",
    href: "/apps/defrag/workspace",
    question: "What happened?",
    description: "Bring the lived moment. Defrag identifies the active pattern and the cleanest next move.",
    tier: "Free",
  },
  {
    name: "Alignment",
    href: "/product/alignment",
    question: "What happens between us?",
    description: "Understand the relational field: shared strengths, friction points, activation loops, and repair paths.",
    tier: "Pro",
  },
  {
    name: "Covenant",
    href: "/product/covenant",
    question: "How do we move forward?",
    description: "Turn understanding into grounded agreements, boundaries, practices, and repair commitments.",
    tier: "Pro",
  },
] as const

export const constitutionalResponseStructure = [
  "Diagnosis",
  "Explanation",
  "Pattern connection",
  "Clean move",
  "Reflection",
] as const
