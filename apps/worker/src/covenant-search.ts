import { sanitizeInput, detectPromptInjection } from "./utils/sanitize.js";
import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { getCorsHeaders } from "./cors.js";
import { SECURITY_PREFIX } from "./prompts.js";

// ── Covenant scripture search by theme ────────────────────────────────────────
// Search scripture by theme (e.g. "forgiveness", "boundaries", "grief").
// Uses AI to select relevant passages and provide brief reflections.
// Note: Covenant is a Pro feature — subscription check done at billing layer.

const SYSTEM_COVENANT_SEARCH = SECURITY_PREFIX + `You are Sovereign.os helping a user find scripture that speaks to a specific theme or emotional situation.

Given a theme or situation, return 4-6 relevant scripture passages with brief reflections on why each applies.

Output ONLY valid JSON:
{
  "results": [
    {
      "reference": "string — e.g. Matthew 5:9",
      "text": "string — the verse text (ESV)",
      "theme": "string — the specific theme this verse addresses",
      "reflection": "string — 1-2 sentences on why this applies to the user's situation"
    }
  ]
}

Rules:
- Use accurate scripture references and text (ESV translation preferred)
- Choose passages that are genuinely relevant, not superficially related
- Reflections should be grounded and honest, not performative
- Do not add commentary beyond the reflection field
- Output ONLY the JSON object, no markdown`;

interface ScriptureResult {
  reference: string;
  text: string;
  theme: string;
  reflection: string;
}

// Curated theme → passage seeds for common themes (reduces AI hallucination risk)
const THEME_SEEDS: Record<string, string[]> = {
  forgiveness: ["Matthew 18:21-22", "Colossians 3:13", "Luke 6:37", "Ephesians 4:32"],
  boundaries: ["Matthew 5:37", "Proverbs 4:23", "Galatians 6:5", "Matthew 10:14"],
  grief: ["Psalm 34:18", "Matthew 5:4", "Romans 8:28", "Revelation 21:4"],
  anger: ["Ephesians 4:26", "James 1:19-20", "Proverbs 15:1", "Psalm 37:8"],
  fear: ["Isaiah 41:10", "Psalm 23:4", "2 Timothy 1:7", "John 14:27"],
  trust: ["Proverbs 3:5-6", "Psalm 37:5", "Isaiah 26:3", "Jeremiah 17:7"],
  repair: ["Matthew 5:23-24", "James 5:16", "2 Corinthians 5:18", "Luke 15:20"],
  rest: ["Matthew 11:28-30", "Psalm 23:2", "Exodus 33:14", "Hebrews 4:9-10"],
  identity: ["Psalm 139:14", "Galatians 2:20", "1 Peter 2:9", "Romans 8:16"],
  family: ["Proverbs 22:6", "Ephesians 6:4", "Psalm 127:3", "Colossians 3:21"],
  patience: ["Romans 5:3-4", "James 1:3-4", "Psalm 27:14", "Lamentations 3:25"],
  courage: ["Joshua 1:9", "Psalm 27:1", "Isaiah 40:31", "Philippians 4:13"],
};

export function registerCovenantSearchRoute(router: any, getEnv: () => Env) {
  router.get("/api/covenant/search", async (request: Request) => {
    const env = getEnv();
    const cors = getCorsHeaders(request);

    const user = await getAuthUser(request, env.DB);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Pro feature check — user must have active subscription
    if (user.tier === "free" && user.subscription_status !== "active") {
      return new Response(JSON.stringify({ error: "Pro subscription required for Covenant" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const url = new URL(request.url);
    const rawTheme = url.searchParams.get("theme") || "";
    const limitParam = Math.min(Number(url.searchParams.get("limit") || "5"), 8);

    if (!rawTheme.trim()) {
      return new Response(JSON.stringify({ error: "theme is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const theme = sanitizeInput(rawTheme.trim().slice(0, 200));

    if (detectPromptInjection(theme)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    // Check for seed passages for known themes
    const themeKey = theme.toLowerCase().replace(/[^a-z]/g, "");
    const seeds = THEME_SEEDS[themeKey];
    const seedHint = seeds
      ? `\n\nSuggested passages to consider (verify accuracy): ${seeds.join(", ")}`
      : "";

    const userPrompt = `Theme: "${theme}"\nReturn ${limitParam} relevant scripture passages.${seedHint}`;

    try {
      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.3-70b-instruct-fp8-fast") as any,
        {
          messages: [
            { role: "system" as const, content: SYSTEM_COVENANT_SEARCH },
            { role: "user" as const, content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 800,
        }
      );

      const raw = (aiResponse as any).response ?? String(aiResponse);
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");

      const result = JSON.parse(match[0]) as { results: ScriptureResult[] };

      if (!Array.isArray(result.results)) {
        throw new Error("Invalid response structure");
      }

      return new Response(JSON.stringify({
        results: result.results.slice(0, limitParam),
        theme,
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...cors },
      });
    } catch (e) {
      console.error("[covenant-search] AI error:", e);
      return new Response(JSON.stringify({ error: "Search failed" }), {
        status: 503,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
  });
}