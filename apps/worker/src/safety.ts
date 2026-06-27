// @ts-nocheck
const RISK_WORDS = [
  "kill myself",
  "want to die",
  "hurt myself",
  "suicide",
  "self harm",
  "abuse",
  "unsafe",
  "violence",
  "threat"
];

export function safetyMode(text: string): "normal" | "support" {
  const t = (text || "").toLowerCase();
  for (const w of RISK_WORDS) {
    if (t.includes(w)) return "support";
  }
  return "normal";
}

export function supportResponse() {
  return {
    type: "support" as const,
    message:
      "This may involve real risk or distress. If you feel unsafe or overwhelmed, reaching out for support can help.",
    resources: [
      { label: "Call or text 988 (U.S.)", link: "https://988lifeline.org" },
      { label: "If you are in immediate danger, call local emergency services.", link: "https://www.usa.gov/emergency-help" }
    ],
    confidence: "Support mode" as const
  };
}
