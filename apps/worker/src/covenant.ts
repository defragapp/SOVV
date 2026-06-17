import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { getBaseline, formatBaseline } from "./baseline.js";

const SYSTEM_COVENANT = `You are Covenant inside Sovereign.os.
Your role: connect what the user is walking through to a real human story from Scripture — not as metaphor, but as lived experience.
Be direct. Use plain language. No preaching. No judgment. No religious performance.

Output strictly in this JSON format, no markdown, no code fences:
{
  "figure": "The biblical figure whose story matches this moment (e.g. David, Joseph, Hagar, Moses, Ruth, Job, Abraham, Nehemiah)",
  "reference": "The specific passage or book (e.g. Psalms 55, Genesis 37-50)",
  "pattern": "1-2 sentences: what pattern is active in this moment",
  "story": "2-3 sentences: what happened to this figure — plain, honest, human",
  "whatBroke": "1 sentence: what broke or was lost in their story",
  "howGodMet": "1-2 sentences: how God showed up — not as rescue, but as presence",
  "whatTheyLearned": "1 sentence: what they came to understand",
  "forYou": "2-3 sentences: how this mirrors the user's moment and what it means for them today",
  "nextStep": "1 concrete, human, doable next step — not a lecture, not a list",
  "scriptures": ["passage 1", "passage 2", "passage 3"],
  "reflectionPrompts": ["question 1", "question 2"]
}`;

export function registerCovenantRoute(router: any, getEnv: () => Env) {
  router.post("/api/covenant", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    try {
      const body = await request.json().catch(() => ({})) as any;
      // Accept both "message" and "moment" for compatibility
      const message = body.message || body.moment;

      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Load baseline for context
      let baselineContext = "";
      try {
        const baseline = await getBaseline(env, user.id);
        if (baseline) baselineContext = formatBaseline(baseline);
      } catch {}

      const messages = [
        { role: "system", content: SYSTEM_COVENANT },
        { role: "user", content: `${baselineContext ? `User Baseline Design:\n${baselineContext}\n\n` : ""}What they are walking through:\n${message}` }
      ];

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        { messages, temperature: 0.3, max_tokens: 800 }
      );

      const rawText = (aiResponse as any).response ?? String(aiResponse);
      let parsed: Record<string, any> = {};
      try {
        const match = rawText.trim().match(/\{[\s\S]*\}/);
        if (match) parsed = JSON.parse(match[0]);
      } catch {}

      return new Response(JSON.stringify(parsed), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error: any) {
      console.error("Covenant route error:", error);
      return new Response(JSON.stringify({ error: "Failed to process" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });
}
