import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";

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
      const body = await request.json().catch(() => ({})) as any;
      const { text } = body;

      if (!text) {
        return new Response(JSON.stringify({ error: "Text is required" }), { status: 400 });
      }

      // Use Cloudflare's native AI TTS proxy model (which is free/included in Workers AI limits)
      // This allows us to generate basic audio without an external ElevenLabs key.
      if (!env.AI) {
        return new Response(JSON.stringify({ error: "Cloudflare AI binding is not configured." }), { status: 503 });
      }

      // We use @cf/elevenlabs/tts, which Cloudflare provides natively without needing your own API key
      const response = await env.AI.run("@cf/elevenlabs/tts", {
        text: text
      } as any);

      // It returns a Uint8Array containing the audio data.
      return new Response(response as any, {
        headers: {
          "Content-Type": "audio/mpeg",
        },
      });

    } catch (e: any) {
      console.error(e);
      return new Response(JSON.stringify({ error: "Failed to process audio", details: e.message }), { status: 500 });
    }
  });
}
