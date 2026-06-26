import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { requireActiveSubscription } from "./billing.js";
import { getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { SYSTEM_ALIGNMENT } from "./prompts.js";
import { checkProLimit } from "./plan.js";
import {
  selectActiveSignals,
  buildTimingSignals,
  formatActiveSignalsForPrompt,
} from "./active-signals.js";

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

// ─── Types ─────────────────────────────────────────────────────────────────

export interface AlignmentTagGlossaryItem {
  tag: string
  label: string
}

export interface AlignmentTraitBlock {
  key: string
  lines: string[]
  tags: string[]
  tagGlossary?: AlignmentTagGlossaryItem[]
}

export interface AlignmentBrief {
  hero: {
    anchor: string
    tags: string[]
    tagGlossary?: AlignmentTagGlossaryItem[]
  }
  aligned: AlignmentTraitBlock[]
  misaligned: {
    over: AlignmentTraitBlock[]
    under: AlignmentTraitBlock[]
  }
  currentDrift?: string[]
  action: string[]
  workspaceHref: string
}

// ─── Security prefix (applied to all prompts) ──────────────────────────────

// Security prefix is imported via SYSTEM_ALIGNMENT from prompts.ts
// Local duplicate removed — prompts.ts is the single source of truth

// ─── Entry mode system prompt ──────────────────────────────────────────────

const SYSTEM_ALIGNMENT_ENTRY = "SECURITY_PREFIX_" + `You generate the entry brief for the Alignment space inside Sovereign.os.

The Alignment space helps users get back into their own lane — grounded in who they actually are, not who the situation is pulling them to be.

Your job: turn a user's personal Baseline Design data into a behavior-first entry page that creates recognition before interpretation.

The user should feel "that is exactly how I operate" before they need any explanation.

CRITICAL RULES:
- Use the user's actual baseline-derived data. Different baseline inputs must produce materially different outputs.
- Every visible line must describe something observable in real life — something that can be seen, heard, felt, or noticed.
- Do not write personality summaries. Do not write system explanations. Do not write paragraphs.
- Lines must be short, direct, and human.
- Tags are supporting evidence, not primary content.

Output strictly in this JSON format, no markdown, no code fences:
{
  "hero": {
    "anchor": "1-2 lines max — grounding identity anchor, not advice",
    "tags": ["short tag 1", "short tag 2"],
    "tagGlossary": [{ "tag": "short tag 1", "label": "one short sentence" }]
  },
  "aligned": [
    {
      "key": "trait_key",
      "lines": ["observable behavior line 1", "observable behavior line 2"],
      "tags": ["tag1", "tag2"],
      "tagGlossary": [{ "tag": "tag1", "label": "one short sentence" }]
    }
  ],
  "misaligned": {
    "over": [
      {
        "key": "trait_key_over",
        "lines": ["what over-expression looks like in real life"],
        "tags": ["tag1"],
        "tagGlossary": [{ "tag": "tag1", "label": "one short sentence" }]
      }
    ],
    "under": [
      {
        "key": "trait_key_under",
        "lines": ["what under-expression looks like in real life"],
        "tags": ["tag1"],
        "tagGlossary": [{ "tag": "tag1", "label": "one short sentence" }]
      }
    ]
  },
  "currentDrift": ["optional — max 2 observational lines, no diagnostic tone"],
  "action": ["1-2 lines — immediately usable, calm and clear, no explanation"],
  "workspaceHref": "/apps/alignment/workspace"
}

SECTION RULES:
- hero: 1-2 lines, grounding only, identity anchor
- aligned: 2-4 blocks, each with 2-4 observable behavior lines
- misaligned.over: 1-2 blocks showing over-expression in real life
- misaligned.under: 1-2 blocks showing under-expression in real life
- currentDrift: optional, max 2 lines, observational only
- action: 1-2 lines, immediately usable

Return JSON only.`

// SYSTEM_ALIGNMENT imported from prompts.ts — single source of truth. Local duplicate removed.


// ─── Fallback generators ───────────────────────────────────────────────────

function buildEntryFallback(baselineContext: string): AlignmentBrief {
  return {
    hero: {
      anchor: "You already know how you operate. This is the map back.",
      tags: ["baseline active"],
      tagGlossary: [{ tag: "baseline active", label: "your personal design data is loaded and active" }],
    },
    aligned: [
      {
        key: "decision_timing",
        lines: [
          "You make better decisions when you wait for clarity rather than forcing a move.",
          "The right answer tends to arrive — not get manufactured.",
        ],
        tags: ["timing", "decision"],
        tagGlossary: [
          { tag: "timing", label: "how your natural decision rhythm works" },
          { tag: "decision", label: "the pattern that shows up when you choose" },
        ],
      },
      {
        key: "communication_pattern",
        lines: [
          "You communicate most clearly when you're not trying to manage the other person's reaction.",
          "Directness lands better than diplomacy for you.",
        ],
        tags: ["communication"],
        tagGlossary: [{ tag: "communication", label: "how your natural expression pattern works" }],
      },
    ],
    misaligned: {
      over: [
        {
          key: "over_control",
          lines: [
            "You take on more than is yours to carry.",
            "You manage outcomes that belong to someone else.",
          ],
          tags: ["over-expression"],
          tagGlossary: [{ tag: "over-expression", label: "what happens when this pattern runs too hot" }],
        },
      ],
      under: [
        {
          key: "under_expression",
          lines: [
            "You hold back when directness would move things forward.",
            "You wait for permission that isn't required.",
          ],
          tags: ["under-expression"],
          tagGlossary: [{ tag: "under-expression", label: "what happens when this pattern runs too quiet" }],
        },
      ],
    },
    action: [
      "Name the one thing that is actually yours to do right now.",
      "Do that. Leave the rest.",
    ],
    workspaceHref: "/apps/alignment/workspace",
  }
}

function sanitizeBrief(brief: AlignmentBrief): void {
  // Ensure required fields exist
  if (!brief.hero?.anchor) brief.hero = { anchor: "You already know how you operate.", tags: [] }
  if (!Array.isArray(brief.aligned) || brief.aligned.length === 0) {
    brief.aligned = [{ key: "core", lines: ["Your baseline is active."], tags: [] }]
  }
  if (!brief.misaligned?.over?.length) {
    brief.misaligned = { ...brief.misaligned, over: [{ key: "over", lines: ["Taking on what isn't yours."], tags: [] }] }
  }
  if (!brief.misaligned?.under?.length) {
    brief.misaligned = { ...brief.misaligned, under: [{ key: "under", lines: ["Holding back when directness would help."], tags: [] }] }
  }
  if (!Array.isArray(brief.action) || brief.action.length === 0) {
    brief.action = ["Name what is yours to do. Do that."]
  }
  brief.workspaceHref = "/apps/alignment/workspace"

  // Trim arrays to reasonable lengths
  brief.aligned = brief.aligned.slice(0, 4)
  brief.misaligned.over = brief.misaligned.over.slice(0, 2)
  brief.misaligned.under = brief.misaligned.under.slice(0, 2)
  if (brief.currentDrift) brief.currentDrift = brief.currentDrift.slice(0, 2)
  brief.action = brief.action.slice(0, 2)
}

// ─── Route registration ────────────────────────────────────────────────────

export function registerAlignmentRoute(router: any, getEnv: () => Env) {
  router.post("/api/alignment", async (request: Request) => {
    const env = getEnv();
    const user = await getAuthUser(request, env.DB);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { "Content-Type": "application/json" }
      });
    }

    const subGate = await requireActiveSubscription(user, request);
    if (subGate) return subGate;

    // Per-user Pro daily soft cap (200/day)
    if (env.KV) {
      const limitCheck = await checkProLimit(env.KV, user.id);
      if (!limitCheck.allowed) {
        return new Response(JSON.stringify({
          error: "daily_limit_reached",
          message: "You've reached your daily Alignment limit. It resets at midnight UTC.",
          remaining: 0,
          limit: limitCheck.limit,
        }), { status: 429, headers: { "Content-Type": "application/json" } });
      }
    }

    try {
      const body = await request.json().catch(() => ({})) as any;
      const mode = body.mode ?? "workspace";

      // ── ENTRY MODE ──────────────────────────────────────────────────────
      if (mode === "entry") {
        // Load computed baseline dataset (or fallback to raw baseline)
        // getBaselineForAI returns the full aiDataset context if compiled,
        // or raw DOB/TOB/POB if dataset is still pending
        let baselineContext = "";
        try {
          baselineContext = await getBaselineForAI(env, user.id, "alignment");
        } catch {}

        const now = new Date();
        const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

        const messages = [
          { role: "system", content: SYSTEM_ALIGNMENT_ENTRY },
          {
            role: "user",
            content: [
              baselineContext ? `User Baseline Design:\n${baselineContext}` : "No baseline data available.",
              `Current date: ${dateStr}`,
              body.context?.recent_patterns?.length
                ? `Recent patterns: ${body.context.recent_patterns.join(", ")}`
                : "",
            ].filter(Boolean).join("\n\n")
          }
        ];

        const aiResponse = await env.AI.run(
          (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
          { messages, temperature: 0.3, max_tokens: 900 }
        );

        const rawText = (aiResponse as any).response ?? String(aiResponse);
        let brief: AlignmentBrief | null = null;

        try {
          const match = rawText.trim().match(/\{[\s\S]*\}/);
          if (match) brief = JSON.parse(match[0]) as AlignmentBrief;
        } catch {}

        if (!brief) {
          brief = buildEntryFallback(baselineContext);
        }

        sanitizeBrief(brief);

        return new Response(JSON.stringify(brief), {
          status: 200, headers: { "Content-Type": "application/json" }
        });
      }

      // ── WORKSPACE MODE (preserved exactly) ─────────────────────────────
      const message = body.message;
      if (!message) {
        return new Response(JSON.stringify({ error: "Message is required" }), {
          status: 400, headers: { "Content-Type": "application/json" }
        });
      }
        if (typeof message === "string" && message.length > 3000) {
          return new Response(JSON.stringify({ error: "Message too long. Please keep it under 3000 characters." }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

      let baselineContext = "";
      try {
        baselineContext = await getBaselineForAI(env, user.id, "alignment");
      } catch {}

      // Active signal selection — only reduced signals reach the AI
      let activeSignalsText = "";
      try {
        const dataset = await getBaselineDataset(env, user.id);
        if (dataset?.status === "ready") {
          const activeSignals = selectActiveSignals(dataset, {
            message: typeof message === "string" ? message : "",
            relational: false,
            mode: "self",
          });
          const timingSignals = buildTimingSignals(dataset);
          activeSignalsText = formatActiveSignalsForPrompt(activeSignals, timingSignals);
        }
      } catch {}

      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const messages = [
        { role: "system", content: SYSTEM_ALIGNMENT },
        {
          role: "user",
          content: [
            activeSignalsText || (baselineContext ? `User Baseline Design:\n${baselineContext}` : ""),
            `Current date: ${dateStr}`,
            `What they are navigating:\n${message}`,
          ].filter(Boolean).join("\n\n")
        }
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

      // Add media capabilities for Pro users
      const responseWithMedia = { ...parsed, media: { audioOverviewAvailable: true } };
      return new Response(JSON.stringify(responseWithMedia), {
        status: 200, headers: { "Content-Type": "application/json" }
      });

    } catch (e: any) {
      console.error("Alignment route error:", e);
      return new Response(JSON.stringify({ error: "Failed to process" }), {
        status: 500, headers: { "Content-Type": "application/json" }
      });
    }
  });
}