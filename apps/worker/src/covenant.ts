import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { safetyMode, supportResponse, RISK_WORDS } from "./safety.js"
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
import { validateRequest } from "./middleware/validate-request.js";
import { RateLimiter, extractRateLimitKey, RATE_LIMIT_PRESETS } from "./middleware/rate-limiter.js";
import { KVSafetyLogger, createSafetyEvent } from "./middleware/safety-logger.js";
import { generateRequestId } from "./utils/request-id.js";
import { z } from "zod";

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
    const requestId = generateRequestId();
    let safetyLogger: KVSafetyLogger | null = null;
    let rateLimiter: RateLimiter | null = null;
    let user: any = null;

    try {
      // Initialize safety infrastructure
      if (env.KV) {
        safetyLogger = new KVSafetyLogger(env.KV);
        rateLimiter = new RateLimiter(env.KV, RATE_LIMIT_PRESETS.normal);
      }

      user = await getAuthUser(request, env.DB);

      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
      }

      const subGate = await requireActiveSubscription(user, request);
      if (subGate) return subGate;

      // ════════════════════════════════════════════════════════════════════════
      // SAFETY LAYER 1: REQUEST VALIDATION
      // ════════════════════════════════════════════════════════════════════════
      const validationSchema = z.object({
        message: z.string().optional(),
        moment: z.string().optional(),
      });

      const validationResult = await validateRequest(request, validationSchema, {
        validateContentType: true,
        maxBodySize: 50 * 1024, // 50KB
      });

      if (!validationResult.valid) {
        const errorResult = validationResult as { valid: false; error: any };
        if (safetyLogger && user) {
          await safetyLogger.log(
            createSafetyEvent(user.id, "validation_error", "low", {
              validation_field: errorResult.error.field,
              endpoint: "/api/covenant",
            }, { requestId })
          );
        }
        return new Response(JSON.stringify({
          error: errorResult.error.field,
          message: errorResult.error.error,
        }), {
          status: errorResult.error.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // ════════════════════════════════════════════════════════════════════════
      // SAFETY LAYER 2: RATE LIMITING
      // ════════════════════════════════════════════════════════════════════════
      if (rateLimiter) {
        const rateLimitKey = extractRateLimitKey(request, user.id);
        const limitResult = await rateLimiter.checkLimit(rateLimitKey);

        if (!limitResult.allowed) {
          if (safetyLogger) {
            await safetyLogger.log(
              createSafetyEvent(user.id, "rate_limit_exceeded", "low", {
                endpoint: "/api/covenant",
              }, { requestId })
            );
          }
          return new Response(
            JSON.stringify({
              error: "rate_limit_exceeded",
              message: "Too many requests",
              retryAfter: limitResult.retryAfter,
            }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": String(limitResult.retryAfter),
              },
            }
          );
        }
      }

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

      const body = validationResult.data as any;
      // Accept both "message" and "moment" for compatibility
      const message = body.message || body.moment;

      // ════════════════════════════════════════════════════════════════════════
      // SAFETY LAYER 3: RISK DETECTION
      // ════════════════════════════════════════════════════════════════════════
      if (message && safetyMode(message) === "support") {
        if (safetyLogger) {
          const detectedWord = RISK_WORDS.find((w) => message.toLowerCase().includes(w));
          await safetyLogger.log(
            createSafetyEvent(user.id, "risk_word_detected", "high", {
              riskWord: detectedWord,
              endpoint: "/api/covenant",
            }, { requestId })
          );
        }
        return Response.json(supportResponse(), { status: 200, headers: getCorsHeaders(request) })
      }

      // Input length limit
      if (message && message.length > 2000) {
        return Response.json({ error: "Input too long. Please keep your message under 2000 characters." }, { status: 400 })
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
      if (user && safetyLogger) {
        await safetyLogger.log(
          createSafetyEvent(user.id, "system_error", "medium", {
            error: error?.message || "Unknown error",
            endpoint: "/api/covenant",
          }, { requestId })
        ).catch((err) => console.error("Failed to log safety event:", err));
      }
      return new Response(JSON.stringify({ error: "Failed to process" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });
}
