/**
 * explain-stream.ts
 *
 * Streaming version of the Defrag explain endpoint.
 * Returns Server-Sent Events (SSE) with token-by-token AI output.
 *
 * The frontend can use this to show progressive text while the full
 * JSON response is being generated.
 *
 * Route: POST /api/explain/stream
 * Response: text/event-stream
 */

import type { Env } from "../types-env.js";
import { getAuthUser, jsonResponse } from "../auth.js";
import { getSessionId, cookieHeader, checkFreeLimit } from "../plan.js";
import { getBaseline } from "../baseline.js";
import { getBaselineForAI, getBaselineDataset } from "../baseline.js";
import { SYSTEM_DEFRAG } from "../prompts.js";
import { getCorsHeaders } from "../cors.js";
import {
  selectActiveSignals,
  buildTimingSignals,
  buildBaselineSignature,
  formatActiveSignalsForPrompt,
} from "../active-signals.js";
import { getCurrentSkySnapshot } from "../baseline-compiler.js";
import { formatBaseline } from "../baseline.js";

export function registerExplainStreamRoute(router: any, getEnv: () => Env) {
  router.post("/api/explain/stream", async (request: Request) => {
    const env = getEnv();

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: getCorsHeaders(request) });
    }

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
      });
    }

    const sid = await getSessionId(request);
    const isPro = user.subscription_status === "active" || user.tier === "pro";
    if (!isPro) {
      const limit = await checkFreeLimit(env, sid);
      if (!limit.allowed) {
        return new Response(JSON.stringify({ error: "daily_limit_reached" }), {
          status: 429,
          headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
        });
      }
    }

    const body = await request.json().catch(() => ({})) as any;
    const message = String(body.message || "").trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "message_required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
      });
    }

    const baseline = await getBaseline(env, sid);
    if (!baseline?.dob) {
      return new Response(JSON.stringify({ type: "needs_baseline" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...getCorsHeaders(request) },
      });
    }

    // Build context
    let activeSignalsText = "";
    const dataset = await getBaselineDataset(env, sid, user.id).catch(() => null);
    if (dataset?.status === "ready") {
      const activeSignals = selectActiveSignals(dataset, { message, relational: false, mode: "self" });
      const userLat = dataset.input.latitude ?? 0;
      const userLng = dataset.input.longitude ?? 0;
      const liveSky = (userLat !== 0 || userLng !== 0)
        ? await getCurrentSkySnapshot(env, userLat, userLng).catch(() => null)
        : null;
      const timingSignals = buildTimingSignals(dataset, liveSky);
      activeSignalsText = formatActiveSignalsForPrompt(activeSignals, timingSignals);
    }

    const baselineText = await getBaselineForAI(env, sid, "defrag").catch(() => formatBaseline(baseline));
    const userContent = [
      activeSignalsText || (baselineText ? `User Baseline Design:\n${baselineText}` : ""),
      `Message:\n${message}`
    ].filter(Boolean).join("\n\n");

    const modelId = (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any;

    // Stream the response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    const sendEvent = async (data: string) => {
      await writer.write(encoder.encode(`data: ${JSON.stringify({ token: data })}\n\n`));
    };

    // Run AI in background and stream tokens
    (async () => {
      try {
        const stream = await env.AI.run(modelId, {
          messages: [
            { role: "system", content: SYSTEM_DEFRAG },
            { role: "user", content: userContent },
          ],
          temperature: 0.35,
          max_tokens: 900,
          stream: true,
        } as any, {
          gateway: { id: env.GATEWAY_ID || "sovereign-ai-gateway" }
        });

        if (stream && typeof (stream as any)[Symbol.asyncIterator] === "function") {
          for await (const chunk of stream as any) {
            const token = chunk?.response || chunk?.token || "";
            if (token) await sendEvent(token);
          }
        } else {
          // Fallback: non-streaming response
          const text = (stream as any)?.response || String(stream);
          await sendEvent(text);
        }

        await writer.write(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
      } catch (err) {
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        ...getCorsHeaders(request),
        "set-cookie": cookieHeader(sid),
      },
    });
  });
}
