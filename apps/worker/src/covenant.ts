import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { safetyMode, supportResponse } from "./safety.js"
import { requireActiveSubscription } from "./billing.js";
import { getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { checkProLimit } from "./plan.js";
import { SYSTEM_COVENANT } from "./prompts.js";
import {
  selectActiveSignals,
  buildTimingSignals,
  formatActiveSignalsForPrompt,
} from "./active-signals.js";

/**
 * CRITICAL SYSTEM RULE
 *
 * Full baseline compute is never used directly in prompts or UI.
 * All reasoning must pass through the active signal selection layer.
 *
 * If this rule breaks, the system will drift back into:
 * - framework dumping
 * - prompt hallucination
 * - inconsistent outputs
 */

/**
 * COVENANT RULE
 *
 * Covenant does not re-run Defrag.
 * It reframes meaning from already reduced signals.
 *
 * Covenant consumes: activeSignals + timingSignals
 * Covenant must NOT: re-derive structural pattern from scratch
 *
 * If this breaks, Covenant becomes a second Defrag
 * and the system loses clarity.
 */
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

      // Safety check
      if (message && safetyMode(message) === "support") {
        return Response.json(supportResponse(), { status: 200 })
      }

      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }
      // Input length validation — prevent abuse
      if (typeof message === "string" && message.length > 3000) {
        return new Response(JSON.stringify({ error: "Message too long. Please keep it under 3000 characters." }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        {  temperature: 0.3, max_tokens: 800 }
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
