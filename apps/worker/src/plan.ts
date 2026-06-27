// @ts-nocheck
import type { Env } from "./types-env.js";

export type Plan = "free" | "pro";

export async function getSessionId(req: Request): Promise<string> {
  const cookie = req.headers.get("Cookie") || "";
  const match = cookie.match(/sid=([a-zA-Z0-9_-]+)/);
  if (match) return match[1] ?? "";
  return crypto.randomUUID().replace(/-/g, "");
}

/**
 * Gets the plan level from KV (legacy — use subscription_status from DB instead).
 */
export async function getPlan(env: Env, sid: string): Promise<Plan> {
  const v = await env.KV.get(`plan:${sid}`);
  return v === "pro" ? "pro" : "free";
}

/**
 * Sets the plan level in KV (legacy — use subscription_status in users table instead).
 */
export async function setPlan(env: Env, sid: string, plan: Plan): Promise<void> {
  await env.KV.put(`plan:${sid}`, plan);
}

/**
 * Checks the free tier daily usage limit for a session.
 * Returns true if the session is under the limit, false if exceeded.
 * Count resets daily based on UTC date.
 */
export async function checkFreeLimit(env: Env, sid: string): Promise<{ allowed: boolean; remaining: number }> {
  const dailyLimit = parseInt(env.FREE_DAILY_LIMIT || "15", 10);
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
  const key = `usage:${sid}:${today}`;

  const current = await env.KV.get(key);
  const count = current ? parseInt(current, 10) : 0;

  if (count >= dailyLimit) {
    return { allowed: false, remaining: 0 };
  }

  // Increment and set TTL to expire at end of day
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const ttl = Math.floor((endOfDay.getTime() - now) / 1000);

  await env.KV.put(key, String(count + 1), { expirationTtl: ttl });
  return { allowed: true, remaining: dailyLimit - count - 1 };
}

export function cookieHeader(sid: string): string {
  // Secure + SameSite for production; HttpOnly is fine because we don't need JS access.
  return `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}

export const PRO_DAILY_LIMIT = 200

export async function checkProLimit(
  kv: KVNamespace,
  userId: string
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  const key = `pro-usage:${userId}:${new Date().toISOString().slice(0, 10)}`
  const raw = await kv.get(key)
  const count = raw ? parseInt(raw, 10) : 0
  if (count >= PRO_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, limit: PRO_DAILY_LIMIT }
  }
  await kv.put(key, String(count + 1), { expirationTtl: 86400 })
  return { allowed: true, remaining: PRO_DAILY_LIMIT - count - 1, limit: PRO_DAILY_LIMIT }
}
