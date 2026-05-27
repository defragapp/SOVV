// apps/worker/src/explain.ts
import { BaselineRecord, BASELINE_VERSION } from "@sovv/core/types";

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
  const userId = c.get("userId");
  const baseline = await getBaseline(c.env.KV_NAMESPACE, userId);

  const needs_baseline =
    !baseline || !baseline.dob || !baseline.tob || !baseline.pob;

  // Exact contract boundary match: { type: "needs_baseline" }
  if (needs_baseline) {
    return c.json({ type: "needs_baseline" }, 200);
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
        content: `Explain based on: ${JSON.stringify(baseline)}`,
      },
    ],
  });

  try {
    const parsed = JSON.parse(response.response.trim());
    return c.json({ type: "explanation", data: parsed });
  } catch {
    return c.json(
      { type: "error", message: "model_parse_failure", raw: response.response },
      500
    );
  }
}
