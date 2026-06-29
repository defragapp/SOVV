import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { safetyMode, supportResponse, RISK_WORDS } from "./safety.js";
import { getCorsHeaders } from "./cors.js";
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
 */

/**
 * COVENANT RULE
 *
 * Covenant does not re-run Defrag.
 * It reframes meaning from already reduced signals.
 *
 * Covenant consumes: activeSignals + timingSignals
 * Covenant must NOT: re-derive structural pattern from scratch
 */

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function extractJsonObject(rawText: string): Record<string, any> | null {
  try {
    const match = rawText.trim().match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

function buildCovenantFallback(message: string): Record<string, any> {
  return {
    figure: "the present moment",
    reference: "Covenant reflection",
    pattern: "A place in you is asking to be met with steadiness instead of pressure.",
    story: "This moment may be less about solving everything at once and more about returning to what is true, humble, and yours to carry.",
    whatBroke: "The old reflex was to carry the whole weight alone.",
    howGodMet: "God meets you by narrowing the next step and reminding you that burden is not the same as obedience.",
    whatTheyLearned: "Return to the faithful next thing rather than trying to control the whole outcome.",
    forYou: `Bring this before God plainly: ${message}`,
    nextStep: "Name one faithful action you can take today, then release what is not yours to force.",
    scriptures: [],
    reflectionPrompts: [
      "What part of this am I trying to carry without grace?",
      "What is the next faithful step, not the entire solution?",
    ],
  };
}

async function buildReducedSignalContext(env: Env, userId: string, message: string): Promise<string> {
  try {
    const dataset = await getBaselineDataset(env, userId);
    if (dataset?.status === "ready") {
      const activeSignals = selectActiveSignals(dataset, {
        message,
        relational: false,
        mode: "self",
      });
      const timingSignals = buildTimingSignals(dataset);
      return formatActiveSignalsForPrompt(activeSignals, timingSignals);
    }
  } catch {}

  try {
    return await getBaselineForAI(env, userId, "covenant");
  } catch {
    return "";
  }
}

export function registerCovenantRoute(router: any, getEnv: () => Env) {
  router.post("/api/covenant", async (request: Request) => {
    const env = getEnv();
    const requestId = generateRequestId();
    let safetyLogger: KVSafetyLogger | null = null;
    let rateLimiter: RateLimiter | null = null;
    let user: any = null;

    try {
      if (env.KV) {
        safetyLogger = new KVSafetyLogger(env.KV);
        rateLimiter = new RateLimiter(env.KV, RATE_LIMIT_PRESETS.normal);
      }

      user = await getAuthUser(request, env.DB);
      if (!user) {
        return jsonResponse({ error: "Unauthorized", requestId }, 401);
      }

      const subGate = await requireActiveSubscription(user, request);
      if (subGate) return subGate;

      const validationSchema = z.object({
        message: z.string().optional(),
        moment: z.string().optional(),
      });

      const validationResult = await validateRequest(request, validationSchema, {
        validateContentType: true,
        maxBodySize: 50 * 1024,
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
        return jsonResponse({
          error: errorResult.error.field,
          message: errorResult.error.error,
          requestId,
        }, errorResult.error.status);
      }

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
          return jsonResponse({
            error: "rate_limit_exceeded",
            message: "Too many requests",
            retryAfter: limitResult.retryAfter,
            requestId,
          }, 429, { "Retry-After": String(limitResult.retryAfter) });
        }
      }

      if (env.KV) {
        const limitCheck = await checkProLimit(env.KV, user.id);
        if (!limitCheck.allowed) {
          return jsonResponse({
            error: "daily_limit_reached",
            message: "You've reached your daily Covenant limit. It resets at midnight UTC.",
            remaining: 0,
            limit: limitCheck.limit,
            requestId,
          }, 429);
        }
      }

      const body = validationResult.data as any;
      const message = typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : typeof body.moment === "string" && body.moment.trim()
          ? body.moment.trim()
          : "";

      if (!message) {
        return jsonResponse({ error: "Message is required", requestId }, 400);
      }

      if (message.length > 3000) {
        return jsonResponse({ error: "Message too long. Please keep it under 3000 characters.", requestId }, 400);
      }

      if (safetyMode(message) === "support") {
        if (safetyLogger) {
          const detectedWord = RISK_WORDS.find((w) => message.toLowerCase().includes(w));
          await safetyLogger.log(
            createSafetyEvent(user.id, "risk_word_detected", "high", {
              riskWord: detectedWord,
              endpoint: "/api/covenant",
            }, { requestId })
          );
        }
        return Response.json(supportResponse(), { status: 200, headers: getCorsHeaders(request) });
      }

      const signalContext = await buildReducedSignalContext(env, user.id, message);
      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const messages = [
        { role: "system", content: SYSTEM_COVENANT },
        {
          role: "user",
          content: [
            signalContext ? `Reduced baseline signals:\n${signalContext}` : "No reduced baseline signals available.",
            `Current date: ${dateStr}`,
            `Moment to reframe:\n${message}`,
          ].join("\n\n"),
        },
      ];

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        { messages, temperature: 0.3, max_tokens: 800 }
      );

      const rawText = (aiResponse as any).response ?? String(aiResponse);
      const parsed = extractJsonObject(rawText) ?? buildCovenantFallback(message);

      return jsonResponse({
        ...parsed,
        media: { audioOverviewAvailable: true },
        requestId,
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
      return jsonResponse({ error: "Failed to process", requestId }, 500);
    }
  });
}
