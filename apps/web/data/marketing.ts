export const PRICING_CONFIG = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Start understanding the pattern.",
    features: [
      "Baseline Design",
      "Defrag space — full access",
      "5 sessions per day",
      "Clear next responses"
    ],
    cta: "Start Free",
    href: "/login"
  },
  pro: {
    name: "Pro",
    price: "$12",
    period: "month",
    highlight: "Recommended",
    description: "For patterns that need continuity.",
    features: [
      "Unlimited sessions",
      "Covenant space",
      "Alignment space",
      "Save results to your Library",
      "Audio Overview",
      "Invite Privately",
      "Full Library depth"
    ],
    cta: "Upgrade to Pro",
    href: "/login",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || "price_default"
  }
}

export const faqItems = [
  {
    q: "What is Sovereign.os?",
    a: "Sovereign.os helps you work through the patterns that keep showing up in your relationships, family, messages, grief, and boundaries — then save what you learn before the moment disappears."
  },
  {
    q: "What is Baseline Design?",
    a: "Your Baseline Design gives Sovereign.os context for how you process pressure, conflict, connection, repair, timing, and alignment. Not as a label. Not as an excuse. As context."
  },
  {
    q: "What is Defrag?",
    a: "Defrag is where the pattern becomes workable. It helps you make sense of conflict, family roles, grief, boundaries, communication breakdowns, parenting pressure, team dynamics, and relationship patterns."
  },
  {
    q: "What is Covenant?",
    a: "Covenant is for users who want faith connected to the work. Not as certainty. Not as performance. Not as a shortcut around responsibility. But as faith connected to repair and the next honest step."
  }
];
