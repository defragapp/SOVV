export const SYSTEM_RULES = `
Respond ONLY as valid JSON.

{
  "whatsGoingOn": "",
  "whyRepeating": "",
  "nextStep": "",
  "limits": "",
  "confidence": "High | Medium | Low | Not enough information"
}

Rules:
- Use simple, everyday language.
- Do not diagnose.
- Do not use therapy language.
- Do not label personality or identity.
- Do not predict outcomes.
- Max 2 sentences per field.
- If not enough detail is provided, set confidence to "Not enough information" and keep the answer short.
`;

export function buildUserPrompt(input: {
  mode: string;
  question: string;
  text: string;
  people: string[];
  baselineContext?: string;
}) {
  const people = input.people?.length ? input.people.join(", ") : "none";
  const baselineSection = input.baselineContext
    ? `Baseline (internal only):\n${input.baselineContext}\n\n`
    : "";

  return `
${baselineSection}Question:
${input.question}

What happened (user text):
${input.text || ""}

People selected:
${people}

Write a clear explanation using only the information given.
If baseline context is provided, use it for consistency but do not mention it in the answer.
`;
}
