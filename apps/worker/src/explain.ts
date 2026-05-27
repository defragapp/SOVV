import { BaselineRecord, BASELINE_VERSION } from "@sovv/core/types";
import { generateGeneKeys } from "@sovv/core/geneKeys";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export async function getBaseline(
  kv: KVNamespace,
  userId: string
): Promise<BaselineRecord | null> {
  const raw = await kv.get(`user:${userId}:profile`);
  if (!raw) return null;

  const record = JSON.parse(raw) as Partial<BaselineRecord>;

  // Migration path: v1 -> v2
  if (!record._version || record._version < BASELINE_VERSION) {
    const migrated: BaselineRecord = {
      _version: BASELINE_VERSION,
      dob: record.dob ?? "",
      tob: record.tob ?? "",
      pob: record.pob ?? "",
    };
    await kv.put(`user:${userId}:profile`, JSON.stringify(migrated));
    return migrated;
  }

  return record as BaselineRecord;
}

export async function handleExplain(c: any) {
  if (c.req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  const userId = c.get("userId");
  const baseline = await getBaseline(c.env.KV_NAMESPACE, userId);
  const geneKeys = baseline ? generateGeneKeys(baseline) : null;

  const needs_baseline =
    !baseline || !baseline.dob || !baseline.tob || !baseline.pob;

  // Exact contract boundary match: { type: "needs_baseline" }
  if (needs_baseline) {
    return c.json({ type: "needs_baseline" }, 200, CORS_HEADERS);
  }

  // Ensure resolvedKeys is defined correctly before the AI binding call
  const resolvedKeys = geneKeys;

  // Proceed to AI binding only after baseline is confirmed
  const response = await c.env.AI_BINDING.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content: "You are a precise analytical engine. Respond with valid JSON only. No prose, no markdown, no greetings. Schema: { \"interpretation\": string, \"aspects\": string[] }"
      },
      {
        role: "user",
        content: `Analyze this deterministic identity profile. Speak directly, clearly, and with total candor. You are an analyst reading a structural blueprint, not a life coach.

Baseline Profile:
${JSON.stringify(baseline)}

Resolved Gene Keys:
${JSON.stringify(resolvedKeys)}

Instructions:
1. 'interpretation' (string): Write a sharp, 2-3 sentence synthesis of their core architecture based on the interaction of their keys. Focus on the tension between their shadows and gifts.
2. 'aspects' (string[]): Return exactly 4 sharp bullet points. Each point MUST directly reference a Gene Key role (Life Work, Evolution, Radiance, or Purpose) and its specific theme.
3. Tone: Esoteric Brutalism. Do not use abstract AI filler like "synergy," "holistic," "paradigm," or "journey". Use grounded, structural language. 
4. Never repeat the raw JSON data back to the user. Synthesize it.

Return JSON only in this format:
{
  "interpretation": string,
  "aspects": string[]
}`
      }
    ],
  });

  return new Response(JSON.stringify(response), {
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
