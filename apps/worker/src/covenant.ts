import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";

const SYSTEM_COVENANT = `You are Covenant, an optional faith-context reflection space inside Sovereign.os.
Your role is to help the user understand what they are walking through by connecting their moment to faith-based themes and reflection.
Do NOT preach, judge, or claim religious authority. Use plain language.
Output strictly in JSON format with the following keys:
{
  "moment_feels_like": "Brief empathy on the pressure",
  "story_connection": "A faith-based story or theme that may help frame it",
  "reflection_prompt": "A single question to carry with them",
  "next_step": "One grounded next step"
}`;

export function registerCovenantRoute(router: any, getEnv: () => Env) {
  router.post("/api/covenant", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);
    
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try {
      const body = await request.json().catch(() => ({})) as any;
      const { moment, baselineContext } = body;

      if (!moment) {
        return new Response(JSON.stringify({ error: "Moment is required" }), { status: 400 });
      }

      const messages = [
        { role: "system", content: SYSTEM_COVENANT },
        { role: "user", content: `User Baseline Context:\n${baselineContext || 'None provided'}\n\nActive Moment:\n${moment}` }
      ];

      const aiResponse = await env.AI.run(env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast", {
        messages
      }, {
        gateway: { id: env.GATEWAY_ID || "sovereign-code-agent" }
      });

      return new Response(JSON.stringify({ success: true, result: aiResponse.response }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error: any) {
      console.error("Covenant route error:", error);
      return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
    }
  });
}