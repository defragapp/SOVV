import type { Env } from "./types-env.js";
import { withLimitedRetry } from "./runtime-resilience.js";

function todayKey(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

export async function useOne(env: Env, sid: string): Promise<{ ok: boolean; remaining: number }> {
  const limit = Number(env.FREE_DAILY_LIMIT || "15");
  const key = `use:${sid}:${todayKey()}`;
  const current = Number((await withLimitedRetry("kv_use_count_get", () => env.KV.get(key), 2)) || "0");

  const next = current + 1;
  await withLimitedRetry(
    "kv_use_count_put",
    () => env.KV.put(key, String(next), { expirationTtl: 60 * 60 * 36 }),
    2
  ); // ~36h

  const remaining = Math.max(0, limit - next);
  return { ok: next <= limit, remaining };
}
