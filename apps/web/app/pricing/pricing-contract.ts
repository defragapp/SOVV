export const LAUNCH_PRICING = {
  freeDailySessions: 15,
  monthlyPriceUsd: 20,
  annualPriceUsd: 99,
  monthlyPlan: "monthly",
  annualPlan: "annual",
  monthlyStripePriceId: "price_1Te0g9Bk78yJ8Hww8fFZCqhm",
  annualStripePriceId: "price_1Tq6nPBk78yJ8Hwwm0pxg4hH",
} as const

export const FREE_FEATURES = [
  "Baseline Design",
  "Defrag — full access",
  `${LAUNCH_PRICING.freeDailySessions} sessions per day`,
  "Pattern recognition output",
  "Best Next Response",
] as const

export const PRO_FEATURES = [
  "Everything in Free",
  "Unlimited sessions",
  "Covenant",
  "Alignment",
  "Save results to your Library",
  "Audio Overview",
  "Private invites",
] as const
