// apps/worker/src/explain.ts
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

  // Proceed to AI binding only after baseline is confirmed
  const response = await c.env.AI_BINDING.run("@cf/meta/llama-3-8b-instruct", {
    messages: [
      {
        role: "system",
        content: `You are a structured data API. Respond with valid JSON only. No prose, no markdown. Schema: { "interpretation": string, "aspects": string[] }`,
      },
      {
        role: "user",
        content: `Interpret this user profile.

Baseline:
${JSON.stringify(baseline)}

Gene Keys:
${JSON.stringify(geneKeys)}

Return JSON only in this format:
{
  "interpretation": string,
  "aspects": string[]
}`,
      },
    ],
  });

  try {
    const parsed = JSON.parse(response.response.trim());
    return c.json({ type: "explanation", data: parsed }, 200, CORS_HEADERS);
  } catch {
    return c.json(
      { type: "error", message: "model_parse_failure", raw: response.response },
      500,
      CORS_HEADERS
    );
  }
}
