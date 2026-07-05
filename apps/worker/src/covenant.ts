import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { resolveEntitlements, requireEntitlement } from "./entitlements.js";
import { getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { checkProLimit } from "./plan.js";
import { SYSTEM_COVENANT } from "./prompts.js";
import { checkGuardrails } from "./output-validator.js";
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

    const entitlements = resolveEntitlements(user);
    const subGate = requireEntitlement(entitlements, "canUseCovenant");
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

      // Build baseline context and active signals
      let activeSignalsText = "";
      let baselineContext = "";
      try {
        const dataset = await getBaselineDataset(env, user.id);
        if (dataset?.status === "ready") {
          const activeSignals = selectActiveSignals(dataset, {
            message: typeof message === "string" ? message : "",
            relational: false,
            mode: "self",
          });
          // Fetch live sky for current timing context
          const userLat = dataset.input.latitude ?? 0;
          const userLng = dataset.input.longitude ?? 0;
          const liveSky = (userLat !== 0 || userLng !== 0)
            ? await getCurrentSkySnapshot(env, userLat, userLng).catch(() => null)
            : null;
          const timingSignals = buildTimingSignals(dataset, liveSky);
          activeSignalsText = formatActiveSignalsForPrompt(activeSignals, timingSignals);
        } else {
          // Fallback to raw baseline text
          baselineContext = await getBaselineForAI(env, user.id, "covenant").catch(() => "");
        }
      } catch { /* non-blocking */ }

      const userContent = [
        activeSignalsText || (baselineContext ? `User Baseline Design:\n${baselineContext}` : ""),
        `What they are navigating:\n${message}`
      ].filter(Boolean).join("\n\n");

      const messages = [
        { role: "system" as const, content: SYSTEM_COVENANT },
        { role: "user" as const, content: userContent },
      ];

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        { messages, temperature: 0.3, max_tokens: 900 },
        { gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" } }
      );

      let rawText = (aiResponse as any).response ?? String(aiResponse);

      // Validate, score, and retry if needed
      const { validateAndScore: validate, buildRetryPrompt: retryPrompt } = await import("./output-validator.js")
      let validation = validate(rawText, "covenant")

      if (validation.shouldRetry) {
        console.warn("[Retry] Covenant output empty — retrying")
        const retryAi = await env.AI.run(
          (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
          { messages: [
              { role: "system", content: SYSTEM_COVENANT },
              { role: "user", content: [activeSignalsText || (baselineContext ? `User Baseline Design:\n${baselineContext}` : ""), `What they are navigating:\n${message}`].filter(Boolean).join("\n\n") },
              { role: "assistant", content: rawText },
              { role: "user", content: retryPrompt("covenant", validation.missing) },
            ], temperature: 0.2, max_tokens: 800 }
        ,
          { gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" } })
        rawText = (retryAi as any).response ?? String(retryAi)
        validation = validate(rawText, "covenant")
      }

      let parsed: Record<string, any> = validation.output;

      // Log guardrail violations
      if (!validation.guardrails.passed) {
        console.warn("[Guardrail] Covenant violations:", validation.guardrails.violations)
      }

      // Empty result guard
      if (!parsed.forYou && !parsed.whatIsTrue && !parsed.figure && !parsed.pattern) {
        return new Response(JSON.stringify({
          error: "incomplete_output",
          message: "The system couldn't read this moment clearly. Try describing it with more specific detail."
        }), { status: 200, headers: { "Content-Type": "application/json" } })
      }

      // Add media capabilities and confidence scoring
      const covenantConfidence = validation.scoring as any
      const responseWithMedia = {
        ...parsed,
        media: { audioOverviewAvailable: true },
        confidence: {
          score: covenantConfidence?.confidence ?? 0.5,
          strength: covenantConfidence?.certainty === "stable" ? "high" : covenantConfidence?.certainty === "emerging" ? "medium" : "low",
        },
      };
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
