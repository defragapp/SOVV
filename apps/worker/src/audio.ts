import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { logSafetyEvent } from "./safety.js";

export function registerAudioRoute(router: any, getEnv: () => Env) {
  router.post("/api/audio", async (request: Request) => {
    const env = getEnv();
    const requestId = crypto.randomUUID();
    const endpoint = "/api/audio";
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

    // Subscription gate: Audio Overview requires active Pro subscription
    const subGate = await requireActiveSubscription(user, request, requestId);
    if (subGate) {
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "authz_failed", userId: user.id },
      });
      return subGate;
    }

    try {
      const body = await request.json().catch(() => ({})) as Record<string, unknown>;
      const text = body.text;

      if (typeof text !== "string" || !text.trim()) {
        await logSafetyEvent(env, {
          type: "validation_error",
          requestId,
          metadata: { endpoint, reason: "text_required", userId: user.id },
        });
        return errorJson(400, "text_required", "Text is required");
      }
      if (text.length > 6000) {
        await logSafetyEvent(env, {
          type: "validation_error",
          requestId,
          metadata: { endpoint, reason: "text_too_long", userId: user.id },
        });
        return errorJson(400, "text_too_long", "Text too long. Please keep it under 6000 characters.");
      }
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "validation_passed", userId: user.id },
      });

      // Use Cloudflare's native AI TTS proxy model (which is free/included in Workers AI limits)
      // This allows us to generate basic audio without an external ElevenLabs key.
      if (!env.AI) {
        await logSafetyEvent(env, {
          type: "system_error",
          requestId,
          metadata: { endpoint, reason: "ai_binding_missing", userId: user.id },
        });
        return errorJson(503, "ai_not_configured", "Cloudflare AI binding is not configured.");
      }

      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "business_start", userId: user.id },
      });

      // We use @cf/elevenlabs/tts, which Cloudflare provides natively without needing your own API key
      const response = await env.AI.run("@cf/elevenlabs/tts", {
        text: text
      });

      // It returns a Uint8Array containing the audio data.
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
      return new Response(response as any, {
        headers: {
          "Content-Type": "audio/mpeg",
          "x-request-id": requestId,
        },
      });

    } catch (e: any) {
      await logSafetyEvent(env, {
        type: "system_error",
        requestId,
        metadata: { endpoint, reason: "audio_processing_failed", userId: user.id, error: e?.message || String(e) },
      });
      return errorJson(500, "audio_processing_failed", "Failed to process audio");
    }
  });
}
