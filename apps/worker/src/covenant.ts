import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { getBaselineForAI } from "./baseline.js";
import { SYSTEM_COVENANT } from "./prompts.js";
import { checkProLimit } from "./plan.js";

// SYSTEM_COVENANT imported from prompts.ts


export function registerCovenantRoute(router: any, getEnv: () => Env) {
  router.post("/api/covenant", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    // Per-user Pro daily soft cap (200/day)
    if (env.KV) {
      const limitCheck = await checkProLimit(env.KV, user.id);
      if (!limitCheck.allowed) {
        return new Response(JSON.stringify({
          error: "daily_limit_reached",
          message: "You've reached your daily Covenant limit. It resets at midnight UTC.",
          remaining: 0,
          limit: limitCheck.limit,
        }), { status: 429, headers: { "Content-Type": "application/json" } });
      }
    }

    try {
      const body = await request.json().catch(() => ({})) as any;
      // Accept both "message" and "moment" for compatibility
      const message = body.message || body.moment;

      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      // Input length validation — prevent abuse
      if (typeof message === "string" && message.length > 3000) {
        return new Response(JSON.stringify({ error: "Message too long. Please keep it under 3000 characters." }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Load computed baseline dataset (or fallback to raw baseline)
      let baselineContext = "";
      try {
        baselineContext = await getBaselineForAI(env, user.id, "covenant");
      } catch {}

      const messages = [
        { role: "system", content: SYSTEM_COVENANT },
        { role: "user", content: `${baselineContext ? `User Baseline Design:\n${baselineContext}\n\n` : ""}What they are walking through:\n${message}` }
      ];

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        { messages, temperature: 0.3, max_tokens: 800 }
      );

      const rawText = (aiResponse as any).response ?? String(aiResponse);
      let parsed: Record<string, any> = {};
      try {
        const match = rawText.trim().match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {}

      // Add media capabilities for Pro users (subscription gate already passed)
      const responseWithMedia = { ...parsed, media: { audioOverviewAvailable: true } };
      return new Response(JSON.stringify(responseWithMedia), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error: any) {
      console.error("Covenant route error:", error);
      return new Response(JSON.stringify({ error: "Failed to process" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });
}
