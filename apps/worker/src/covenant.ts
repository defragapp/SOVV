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
import {
  evaluateInputClassification,
  getColdStartMarker,
  getServiceState,
  inspectResponseDrift,
  logDriftDetected,
  logRequestDecision,
  recordServiceOutcome,
  sampleUserPressure,
  shouldBypassAi,
  temporaryUnavailableResponse,
  tuneTokenBudget,
} from "./accountability.js";

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
        await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
          aiExecuted: false,
          responsePath: "support-response",
          supportResponse: true,
          downstreamAiCalls: 0,
        });
        await logSafetyEvent(env, {
          type: "request_lifecycle",
          requestId,
          metadata: {
            endpoint,
            stage: "end",
            userId: user.id,
            inputClassification: "elevated",
            guardrailsTriggered: ["risk_words"],
            aiExecuted: false,
            aiCalls: 0,
            aiRetries: 0,
            responsePath: "support-response",
            degradationState: "NORMAL",
            coldStart,
          },
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
      const serviceState = await getServiceState(env, endpoint);
      const supportMode = message ? safetyMode(message) === "support" : false;
      const preliminary = evaluateInputClassification({
        degradationState: serviceState.state,
        supportMode,
      });
      const pressure = await sampleUserPressure(env, { endpoint, requestId, userId: user.id }, preliminary.classification, supportMode, false);
      const decision = evaluateInputClassification({
        degradationState: serviceState.state,
        supportMode,
        throttleLevel: pressure.throttleLevel,
      });
      await logRequestDecision(env, { endpoint, requestId, userId: user.id }, {
        ...decision,
        supportMode,
        throttleLevel: pressure.throttleLevel,
        degradationState: serviceState.state,
        coldStart,
      });
      if (shouldBypassAi(serviceState.state, "critical", pressure.throttleLevel)) {
        await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
          aiExecuted: false,
          responsePath: "fallback",
          aiFallback: true,
          downstreamAiCalls: 0,
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
            aiExecuted: false,
            aiCalls: 0,
            aiRetries: 0,
            responsePath: "fallback",
            degradationState: serviceState.state,
            throttleLevel: pressure.throttleLevel,
            coldStart,
          },
        });
        return temporaryUnavailableResponse(requestId);
      }

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        {  temperature: 0.3, max_tokens: tuneTokenBudget(800, serviceState.state, pressure.throttleLevel) }
      );

      const rawText = (aiResponse as any).response ?? String(aiResponse);
      let parsed: Record<string, any> = {};
      try {
        const match = rawText.trim().match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {}

      // Add media capabilities for Pro users (subscription gate already passed)
      const responseWithMedia = { ...parsed, media: { audioOverviewAvailable: true } };
      const durationMs = Date.now() - startedAt;
      const parsedSuccessfully = Object.keys(parsed).length > 0;
      const drift = inspectResponseDrift(rawText, parsedSuccessfully ? parsed : null, [
        "figure",
        "story",
        "forYou",
        "nextStep",
      ]);
      if (drift.driftDetected) {
        await logDriftDetected(env, { endpoint, requestId, userId: user.id }, {
          anomalies: drift.anomalies,
          observedKeys: drift.observedKeys,
          responseBytes: drift.responseBytes,
        });
      }
      await recordServiceOutcome(env, { endpoint, requestId, userId: user.id }, {
        aiExecuted: true,
        aiSuccess: parsedSuccessfully,
        aiFallback: !parsedSuccessfully,
        responsePath: parsedSuccessfully ? "normal" : "fallback",
        durationMs,
        slowRequest: durationMs >= 1800,
        responseBytes: drift.responseBytes,
        validationNearFail: drift.driftDetected,
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
          responsePath: parsedSuccessfully ? "normal" : "fallback",
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
          responsePath: parsedSuccessfully ? "normal" : "fallback",
          degradationState: serviceState.state,
          throttleLevel: pressure.throttleLevel,
          coldStart,
          slowRequest: durationMs >= 1800,
          durationMs,
        },
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
