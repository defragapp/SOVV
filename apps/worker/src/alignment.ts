import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";

const SYSTEM_ALIGNMENT = `You are Alignment, a response integration and action choice space inside Sovereign.os.
Your role is to help the user turn insights into actionable responses and conversational steering.
Do NOT sound like a therapist or a chatbot. Be direct and structural.
Output strictly in JSON format with the following keys:
{
  "active_now": "What is active in them",
  "what_is_yours": "What is theirs to carry",
  "what_is_not_yours": "What is not theirs to carry",
  "strain_pattern": "The strain pattern",
  "gift_under_strain": "The gift under strain",
  "alignment": "What needs to align now",
  "best_next_response": "Specific, concrete text or action",
  "stop_repeating": "What to stop repeating"
}`;

export function registerAlignmentRoute(router: any, getEnv: () => Env) {
  router.post("/api/alignment", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Subscription gate: Alignment requires active subscription
    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    if (!env.AI_MODEL || !env.AI) {
      return new Response(JSON.stringify({ error: "AI provider not configured" }), { status: 503 });
    }

    try {
      const body = await request.json().catch(() => ({})) as any;
      const { message, baselineContext } = body;

      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
      }

      const messages = [
        { role: "system", content: SYSTEM_ALIGNMENT },
        { role: "user", content: `User Baseline Context:\n${baselineContext || 'None provided'}\n\nSituation to integrate:\n${message}` }
      ];

      const modelId = env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast";
      const aiResponse = await env.AI.run(modelId, {
        messages,
        temperature: 0.35,
        max_tokens: 600,
      });

      let parsed = {};
      const rawText = (aiResponse as any).response ?? aiResponse;
      try {
        const match = String(rawText).trim().match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch (e) {}

      return new Response(JSON.stringify(parsed), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (e) {
      console.error(e);
      return new Response(JSON.stringify({ error: "Failed to process alignment" }), { status: 500 });
    }
  });
}
