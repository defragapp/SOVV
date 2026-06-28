import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { logSafetyEvent } from "./safety.js";
import {
  evaluateInputClassification,
  getColdStartMarker,
  getServiceState,
  logRequestDecision,
  recordServiceOutcome,
  sampleUserPressure,
  shouldBypassAi,
  temporaryUnavailableResponse,
  tuneTokenBudget,
} from "./accountability.js";

export function registerAudioRoute(router: any, getEnv: () => Env) {
  router.post("/api/audio", async (request: Request) => {
    const env = getEnv();
    const requestId = crypto.randomUUID();
    const endpoint = "/api/audio";
    const startedAt = Date.now();
    const coldStart = getColdStartMarker();
    const user = await getAuthUser(request, env.DB);
    await logSafetyEvent(env, {
      type: "request_lifecycle",
      requestId,
      metadata: { endpoint, stage: "start", userId: user?.id ?? null, coldStart },
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
      const serviceState = await getServiceState(env, endpoint);
      const preliminary = evaluateInputClassification({ degradationState: serviceState.state });
      const pressure = await sampleUserPressure(env, { endpoint, requestId, userId: user.id }, preliminary.classification, false, false);
      const decision = evaluateInputClassification({
        degradationState: serviceState.state,
        throttleLevel: pressure.throttleLevel,
      });
      await logRequestDecision(env, { endpoint, requestId, userId: user.id }, {
        ...decision,
        supportMode: false,
        throttleLevel: pressure.throttleLevel,
        degradationState: serviceState.state,
        coldStart,
      });

      // Use Cloudflare's native AI TTS proxy model (which is free/included in Workers AI limits)
      // This allows us to generate basic audio without an external ElevenLabs key.
      if (!env.AI) {
        await logSafetyEvent(env, {
          type: "system_error",
          requestId,
          metadata: { endpoint, reason: "ai_binding_missing", userId: user.id },
        });
        await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
          aiExecuted: false,
          responsePath: "fallback",
          aiFallback: true,
          downstreamAiCalls: 0,
        });
        return temporaryUnavailableResponse(requestId);
      }

      if (shouldBypassAi(serviceState.state, "noncritical", pressure.throttleLevel)) {
        await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
          aiExecuted: false,
          responsePath: "fallback",
          aiFallback: true,
          downstreamAiCalls: 0,
        });
        return temporaryUnavailableResponse(requestId);
      }

      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: { endpoint, stage: "business_start", userId: user.id },
      });

      // We use @cf/elevenlabs/tts, which Cloudflare provides natively without needing your own API key
      const response = await env.AI.run("@cf/elevenlabs/tts", {
        text: text,
      });

      // It returns a Uint8Array containing the audio data.
      const durationMs = Date.now() - startedAt;
      await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
        aiExecuted: true,
        aiSuccess: true,
        responsePath: "normal",
        durationMs,
        slowRequest: durationMs >= 1800,
        downstreamAiCalls: 1,
      });
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: {
          endpoint,
          stage: "business_end",
          userId: user.id,
          inputClassification: decision.classification,
          guardrailsTriggered: decision.guardrailsTriggered,
          aiExecuted: true,
          aiCalls: 1,
          aiRetries: 0,
          responsePath: "normal",
          degradationState: serviceState.state,
          throttleLevel: pressure.throttleLevel,
          coldStart,
          slowRequest: durationMs >= 1800,
          durationMs,
        },
      });
      await logSafetyEvent(env, {
        type: "request_lifecycle",
        requestId,
        metadata: {
          endpoint,
          stage: "end",
          userId: user.id,
          inputClassification: decision.classification,
          guardrailsTriggered: decision.guardrailsTriggered,
          aiExecuted: true,
          aiCalls: 1,
          aiRetries: 0,
          responsePath: "normal",
          degradationState: serviceState.state,
          throttleLevel: pressure.throttleLevel,
          coldStart,
          slowRequest: durationMs >= 1800,
          durationMs,
        },
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
      await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
        aiExecuted: false,
        responsePath: "fallback",
        aiFallback: true,
        slowRequest: Date.now() - startedAt >= 1800,
        downstreamAiCalls: 0,
      });
      return temporaryUnavailableResponse(requestId);
    }
  });
}
