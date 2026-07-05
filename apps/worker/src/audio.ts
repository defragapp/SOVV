import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { resolveEntitlements, requireEntitlement } from "./entitlements.js";
import { logSafetyEvent, protectionActive } from "./safety.js";
import { validateRequest } from "./middleware/validate-request.js";
import { RateLimiter, extractRateLimitKey, RATE_LIMIT_PRESETS } from "./middleware/rate-limiter.js";
import { KVSafetyLogger, createSafetyEvent } from "./middleware/safety-logger.js";
import { generateRequestId } from "./utils/request-id.js";
import { z } from "zod";

export function registerAudioRoute(router: any, getEnv: () => Env) {
  router.post("/api/audio", async (request: Request) => {
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
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
      }

      // Subscription gate: Audio Overview requires active Pro subscription
      const entitlements = resolveEntitlements(user);
      const subGate = requireEntitlement(entitlements, "canUseAudio");
      if (subGate) return subGate;

      // ════════════════════════════════════════════════════════════════════════
      // SAFETY LAYER 1: REQUEST VALIDATION
      // ════════════════════════════════════════════════════════════════════════
      const validationSchema = z.object({
        text: z.string(),
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
              endpoint: "/api/audio",
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
                endpoint: "/api/audio",
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

      const body = validationResult.data as any;
      const { text } = body;

      if (!text) {
        return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 });
      }

      if (protectionActive(request, 2)) {
        logSafetyEvent({
          level: "warn",
          event: "audio_protective_fallback",
          request,
          reason: "protection_escalation",
          error_type: "system",
          protection_level: 2,
        });
        return new Response(JSON.stringify({
          error: "Audio overview is temporarily unavailable while the system stabilizes.",
        }), { status: 503, headers: { "Content-Type": "application/json" } });
      }

      // Use Cloudflare's native AI TTS proxy model (which is free/included in Workers AI limits)
      // This allows us to generate basic audio without an external ElevenLabs key.
      if (!env.AI) {
        return new Response(JSON.stringify({ error: "Cloudflare AI binding is not configured." }), { status: 503 });
      }

      // Use Cloudflare Workers AI TTS - try available models in order of preference
      // @cf/deepgram/aura-2-en is the highest quality English TTS available
      let audioResponse: any;
      let contentType = "audio/mpeg";
      try {
        audioResponse = await env.AI.run("@cf/deepgram/aura-2-en" as any, {
          text: text,
        }, { gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" } });
      } catch {
        // Fallback to melotts if aura-2-en is unavailable
        try {
          audioResponse = await env.AI.run("@cf/myshell-ai/melotts" as any, {
            text: text,
          }, { gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" } });
        } catch {
          // Final fallback
          audioResponse = await env.AI.run("@cf/deepgram/aura-1" as any, {
            text: text,
          }, { gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" } });
        }
      }

      return new Response(audioResponse as any, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "no-store",
        },
      });

    } catch (e: any) {
      console.error(e);
      if (user && safetyLogger) {
        await safetyLogger.log(
          createSafetyEvent(user.id, "system_error", "medium", {
            error: e?.message || "Unknown error",
            endpoint: "/api/audio",
          }, { requestId })
        ).catch((err) => console.error("Failed to log safety event:", err));
      }
      return new Response(JSON.stringify({ error: "Failed to process audio", details: e.message }), { status: 500 });
    }
  });
}
