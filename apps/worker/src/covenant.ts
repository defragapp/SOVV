import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { safetyMode, supportResponse, logSafetyEvent } from "./safety.js"
import { getCorsHeaders } from "./cors.js"
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
    const requestId = crypto.randomUUID();
    const endpoint = "/api/covenant";
    const user = await getAuthUser(request, env.DB);
    await logSafetyEvent(env, {
      type: "request_lifecycle",
      requestId,
      metadata: { endpoint, stage: "start", userId: user?.id ?? null },
    });

    const errorJson = (status: number, error: string, message?: string) =>
      new Response(JSON.stringify({ error, ...(message ? { message } : {}), requestId }), {
        status,
        headers: { "Content-Type": "application/json", "x-request-id": requestId },
      });

    if (!user) {
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "auth_failed", userId: null },
      });
      return errorJson(401, "unauthorized");
    }

    const subGate = await requireActiveSubscription(user, request, requestId);
    if (subGate) {
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "authz_failed", userId: user.id },
      });
      return subGate;
    }

    // Per-user Pro daily soft cap (200/day)
    if (env.KV) {
      const limitCheck = await checkProLimit(env.KV, user.id);
      if (!limitCheck.allowed) {
        await logSafetyEvent(env, {
          type: "rate_limit_exceeded",
          requestId,
          metadata: { endpoint, stage: "rate_limit_triggered", userId: user.id, limit: limitCheck.limit },
        });
        return new Response(JSON.stringify({
          error: "daily_limit_reached",
          message: "You've reached your daily Covenant limit. It resets at midnight UTC.",
          remaining: 0,
          limit: limitCheck.limit,
          requestId,
        }), { status: 429, headers: { "Content-Type": "application/json", "x-request-id": requestId } });
      }
    }

    try {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      // Accept both "message" and "moment" for compatibility
      const message =
        typeof body.message === "string"
          ? body.message
          : typeof body.moment === "string"
            ? body.moment
            : "";

      // Safety check
      if (message && safetyMode(message) === "support") {
        await logSafetyEvent(env, {
          type: "request_lifecycle",
          requestId,
          metadata: { endpoint, stage: "validation_passed", userId: user.id, safetyMode: "support" },
        });
        await logSafetyEvent(env, {
          type: "request_lifecycle",
          requestId,
          metadata: { endpoint, stage: "end", userId: user.id },
        });
        return Response.json(supportResponse(), { status: 200, headers: getCorsHeaders(request) })
      }

      // Input length limit
      if (message && message.length > 2000) {
        await logSafetyEvent(env, {
          type: "validation_error",
          requestId,
          metadata: { endpoint, reason: "input_too_long", userId: user.id },
        });
        return errorJson(400, "input_too_long", "Input too long. Please keep your message under 2000 characters.");
      }

      if (!message) {
        await logSafetyEvent(env, {
          type: "validation_error",
          requestId,
          metadata: { endpoint, reason: "message_required", userId: user.id },
        });
        return errorJson(400, "message_required", "Message is required");
      }
      // Input length validation — prevent abuse
      if (typeof message === "string" && message.length > 3000) {
        await logSafetyEvent(env, {
          type: "validation_error",
          requestId,
          metadata: { endpoint, reason: "message_too_long", userId: user.id },
        });
        return errorJson(400, "message_too_long", "Message too long. Please keep it under 3000 characters.");
      }

      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "validation_passed", userId: user.id },
      });
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "business_start", userId: user.id },
      });

      

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
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "business_end", userId: user.id },
      });
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "end", userId: user.id },
      });
      return new Response(JSON.stringify(responseWithMedia), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error: any) {
      await logSafetyEvent(env, {
        type: "system_error",
        requestId,
        metadata: { endpoint, reason: "covenant_route_error", userId: user.id, error: error?.message || String(error) },
      });
      return errorJson(500, "failed_to_process", "Failed to process");
    }
  });
}
