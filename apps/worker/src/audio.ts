import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { parseJsonBody, validateTextInput } from "./safety-validation.js";
import { logSafetyEvent, protectionActive } from "./safety.js";

export function registerAudioRoute(router: any, getEnv: () => Env) {
  router.post("/api/audio", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Subscription gate: Audio Overview requires active Pro subscription
    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    try {
      const parsedBody = await parseJsonBody(request);
      if (parsedBody.ok === false) return parsedBody.response;

      const textValidation = validateTextInput({
        request,
        body: parsedBody.value,
        fields: ["text"],
        requiredPayload: { error: "Text is required" },
      });
      if (textValidation.ok === false) return textValidation.response;

      const { text } = textValidation.value;

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

      // We use @cf/elevenlabs/tts, which Cloudflare provides natively without needing your own API key
      const response = await env.AI.run("@cf/elevenlabs/tts", {
        text: text
      });

      // It returns a Uint8Array containing the audio data.
      return new Response(response as any, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });

    } catch (e: any) {
      logSafetyEvent({
        level: "error",
        event: "audio_generation_failed",
        request,
        error_type: "system",
        error: e,
      });
      return new Response(JSON.stringify({ error: "Failed to process audio", details: e.message }), { status: 500 });
    }
  });
}
