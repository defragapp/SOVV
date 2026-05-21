import type { Env } from "./types-env.js";

export type Plan = "free" | "pro";

export async function getSessionId(req: Request): Promise<string> {
  const cookie = req.headers.get("Cookie") || "";
  const match = cookie.match(/sid=([a-zA-Z0-9_-]+)/);
  if (match) return match[1] ?? "";
  return crypto.randomUUID().replace(/-/g, "");
}

export async function getPlan(env: Env, sid: string): Promise<Plan> {
  const v = await env.KV.get(`plan:${sid}`);
  return v === "pro" ? "pro" : "free";
}

export async function setPlan(env: Env, sid: string, plan: Plan): Promise<void> {
  await env.KV.put(`plan:${sid}`, plan);
}

export function cookieHeader(sid: string): string {
  // Secure + SameSite for production; HttpOnly is fine because we don't need JS access.
  return `sid=${sid}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`;
}
