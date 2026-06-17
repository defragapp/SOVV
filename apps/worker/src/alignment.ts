import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { getBaseline, formatBaseline } from "./baseline.js";

const SYSTEM_ALIGNMENT = `You are Alignment inside Sovereign.os.
Your role: help the user get back into their own lane — grounded in who they actually are, not who the situation is pulling them to be.
You have access to their Baseline Design (how they naturally operate) and the current planetary weather (the emotional tone of the moment).
Be direct. Be specific. No therapy language. No "it sounds like". Name what is true.

Output strictly in this JSON format, no markdown, no code fences:
{
  "skyContext": "1-2 sentences: what the current planetary weather means for this moment — plain language, not astrology jargon",
  "whatIsTrue": "2-3 sentences: the honest read on the situation, stripped of the story they've been telling themselves",
  "whatIsYours": "1-2 sentences: what is theirs to carry — their part, their responsibility, their choice",
  "whatIsNotYours": "1-2 sentences: what belongs to the other side — what they cannot control or fix",
  "theShift": "1-2 sentences: the specific change in posture, timing, or language that would move things forward",
  "nextStep": "1 concrete, human, doable next step — not a list, not a lecture",
  "avoid": "1-2 sentences: the move that feels right in the moment but tends to make things worse for someone with their pattern",
  "alignment": "1 sentence: what it looks like to stay in their own lane through this"
}`;

export function registerAlignmentRoute(router: any, getEnv: () => Env) {
  router.post("/api/alignment", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    try {
      const body = await request.json().catch(() => ({})) as any;
      const message = body.message;

      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), { status: 400, headers: { "Content-Type": "application/json" } });
      }

      // Load baseline for context
      let baselineContext = "";
      try {
        const baseline = await getBaseline(env, user.id);
        if (baseline) baselineContext = formatBaseline(baseline);
      } catch {}

      // Get current date for sky context
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const messages = [
        { role: "system", content: SYSTEM_ALIGNMENT },
        { role: "user", content: `${baselineContext ? `User Baseline Design:\n${baselineContext}\n\n` : ""}Current date: ${dateStr}\n\nWhat they are navigating:\n${message}` }
      ];

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        { messages, temperature: 0.3, max_tokens: 700 }
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
    } catch (e: any) {
      console.error("Alignment route error:", e);
      return new Response(JSON.stringify({ error: "Failed to process" }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  });
}
