import type { Env } from "./types-env.js";
import { getAuthUser } from "./auth.js";
import { safetyMode, supportResponse, RISK_WORDS } from "./safety.js";
import { getCorsHeaders } from "./cors.js";
import { requireActiveSubscription } from "./billing.js";
import { getBaselineForAI, getBaselineDataset } from "./baseline.js";
import { SYSTEM_ALIGNMENT, SECURITY_PREFIX } from "./prompts.js";
import { checkProLimit } from "./plan.js";
import {
  selectActiveSignals,
  buildTimingSignals,
  formatActiveSignalsForPrompt,
} from "./active-signals.js";
import { validateRequest } from "./middleware/validate-request.js";
import { RateLimiter, extractRateLimitKey, RATE_LIMIT_PRESETS } from "./middleware/rate-limiter.js";
import { KVSafetyLogger, createSafetyEvent } from "./middleware/safety-logger.js";
import { generateRequestId } from "./utils/request-id.js";
import { z } from "zod";

/**
 * CRITICAL SYSTEM RULE
 *
 * Full baseline compute is never used directly in prompts or UI.
 * All reasoning must pass through the active signal selection layer.
 */

export interface AlignmentTagGlossaryItem {
  tag: string;
  label: string;
}

export interface AlignmentTraitBlock {
  key: string;
  lines: string[];
  tags: string[];
  tagGlossary?: AlignmentTagGlossaryItem[];
}

export interface AlignmentBrief {
  hero: {
    anchor: string;
    tags: string[];
    tagGlossary?: AlignmentTagGlossaryItem[];
  };
  aligned: AlignmentTraitBlock[];
  misaligned: {
    over: AlignmentTraitBlock[];
    under: AlignmentTraitBlock[];
  };
  currentDrift?: string[];
  action: string[];
  workspaceHref: string;
}

const SYSTEM_ALIGNMENT_ENTRY = `${SECURITY_PREFIX}\nYou generate the entry brief for the Alignment space inside Sovereign.os.

The Alignment space helps users get back into their own lane — grounded in who they actually are, not who the situation is pulling them to be.

Use only reduced baseline signals and timing signals supplied by the system. Do not expose framework dumps, raw chart mechanics, or internal compute.

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
}`;

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

function extractJsonObject(rawText: string): Record<string, any> | null {
  try {
    const match = rawText.trim().match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

function buildEntryFallback(): AlignmentBrief {
  return {
    hero: {
      anchor: "You already know how you operate. This is the map back.",
      tags: ["baseline active"],
      tagGlossary: [{ tag: "baseline active", label: "your reduced baseline signals are loaded and active" }],
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
          "Directness lands better than diplomacy when you are grounded.",
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
  };
}

function sanitizeBrief(brief: AlignmentBrief): AlignmentBrief {
  if (!brief.hero?.anchor) brief.hero = { anchor: "You already know how you operate.", tags: [] };
  if (!Array.isArray(brief.aligned) || brief.aligned.length === 0) {
    brief.aligned = [{ key: "core", lines: ["Your baseline is active."], tags: [] }];
  }
  if (!brief.misaligned?.over?.length) {
    brief.misaligned = { ...brief.misaligned, over: [{ key: "over", lines: ["Taking on what isn't yours."], tags: [] }] };
  }
  if (!brief.misaligned?.under?.length) {
    brief.misaligned = { ...brief.misaligned, under: [{ key: "under", lines: ["Holding back when directness would help."], tags: [] }] };
  }
  if (!Array.isArray(brief.action) || brief.action.length === 0) {
    brief.action = ["Name what is yours to do. Do that."];
  }

  brief.aligned = brief.aligned.slice(0, 4);
  brief.misaligned.over = brief.misaligned.over.slice(0, 2);
  brief.misaligned.under = brief.misaligned.under.slice(0, 2);
  if (brief.currentDrift) brief.currentDrift = brief.currentDrift.slice(0, 2);
  brief.action = brief.action.slice(0, 2);
  brief.workspaceHref = "/apps/alignment/workspace";
  return brief;
}

function buildWorkspaceFallback(message: string): Record<string, any> {
  return {
    skyContext: "Your reduced baseline signals are active, but the model response needed a safe fallback.",
    whatIsTrue: "There is something real in what you are noticing.",
    whatIsYours: "Your part is the next honest, grounded move — not managing the whole outcome.",
    whatIsNotYours: "The other person's reaction, timing, and interpretation are not fully yours to carry.",
    theShift: "Move from pressure to clarity.",
    nextStep: `Name the cleanest next response to this: ${message}`,
    avoid: "Do not over-explain, chase certainty, or take ownership of what belongs to someone else.",
    alignment: "Return to your lane before you respond.",
  };
}

async function buildReducedSignalContext(env: Env, userId: string, message: string): Promise<string> {
  try {
    const dataset = await getBaselineDataset(env, userId);
    if (dataset?.status === "ready") {
      const activeSignals = selectActiveSignals(dataset, {
        message,
        relational: false,
        mode: "self",
      });
      const timingSignals = buildTimingSignals(dataset);
      return formatActiveSignalsForPrompt(activeSignals, timingSignals);
    }
  } catch {}

  try {
    return await getBaselineForAI(env, userId, "alignment");
  } catch {
    return "";
  }
}

export function registerAlignmentRoute(router: any, getEnv: () => Env) {
  router.post("/api/alignment", async (request: Request) => {
    const env = getEnv();
    const requestId = generateRequestId();
    let safetyLogger: KVSafetyLogger | null = null;
    let rateLimiter: RateLimiter | null = null;
    let user: any = null;

    try {
      if (env.KV) {
        safetyLogger = new KVSafetyLogger(env.KV);
        rateLimiter = new RateLimiter(env.KV, RATE_LIMIT_PRESETS.normal);
      }

      user = await getAuthUser(request, env.DB);
      if (!user) {
        return jsonResponse({ error: "Unauthorized", requestId }, 401);
      }

      const subGate = await requireActiveSubscription(user, request);
      if (subGate) return subGate;

      const validationSchema = z.object({
        message: z.string().optional(),
        mode: z.enum(["entry", "workspace", "explore"]).optional(),
        context: z.any().optional(),
      });

      const validationResult = await validateRequest(request, validationSchema, {
        validateContentType: true,
        maxBodySize: 100 * 1024,
      });

      if (!validationResult.valid) {
        const errorResult = validationResult as { valid: false; error: any };
        if (safetyLogger && user) {
          await safetyLogger.log(
            createSafetyEvent(user.id, "validation_error", "low", {
              validation_field: errorResult.error.field,
              endpoint: "/api/alignment",
            }, { requestId })
          );
        }
        return jsonResponse({
          error: errorResult.error.field,
          message: errorResult.error.error,
          requestId,
        }, errorResult.error.status);
      }

      if (rateLimiter) {
        const rateLimitKey = extractRateLimitKey(request, user.id);
        const limitResult = await rateLimiter.checkLimit(rateLimitKey);

        if (!limitResult.allowed) {
          if (safetyLogger) {
            await safetyLogger.log(
              createSafetyEvent(user.id, "rate_limit_exceeded", "low", {
                endpoint: "/api/alignment",
              }, { requestId })
            );
          }
          return jsonResponse({
            error: "rate_limit_exceeded",
            message: "Too many requests",
            retryAfter: limitResult.retryAfter,
            requestId,
          }, 429, { "Retry-After": String(limitResult.retryAfter) });
        }
      }

      const body = validationResult.data as any;
      const mode = body.mode ?? "workspace";
      const message = typeof body.message === "string" ? body.message.trim() : "";
      const recentPatterns = Array.isArray(body?.context?.recent_patterns)
        ? body.context.recent_patterns.join(" ")
        : "";

      const textFieldsToCheck = [message, recentPatterns].filter(Boolean);
      for (const text of textFieldsToCheck) {
        if (safetyMode(text) === "support") {
          if (safetyLogger) {
            const detectedWord = RISK_WORDS.find((w) => text.toLowerCase().includes(w));
            await safetyLogger.log(
              createSafetyEvent(user.id, "risk_word_detected", "high", {
                riskWord: detectedWord,
                endpoint: "/api/alignment",
              }, { requestId })
            );
          }
          if (text === message) {
            return Response.json(supportResponse(), { status: 200, headers: getCorsHeaders(request) });
          }
        }
      }

      if (env.KV) {
        const limitCheck = await checkProLimit(env.KV, user.id);
        if (!limitCheck.allowed) {
          return jsonResponse({
            error: "daily_limit_reached",
            message: "You've reached your daily Alignment limit. It resets at midnight UTC.",
            remaining: 0,
            limit: limitCheck.limit,
            requestId,
          }, 429);
        }
      }

      const dateStr = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      if (mode === "entry") {
        const signalContext = await buildReducedSignalContext(env, user.id, recentPatterns || "alignment entry");
        const messages = [
          { role: "system", content: SYSTEM_ALIGNMENT_ENTRY },
          {
            role: "user",
            content: [
              signalContext ? `Reduced baseline signals:\n${signalContext}` : "No reduced baseline signals available.",
              `Current date: ${dateStr}`,
              recentPatterns ? `Recent patterns:\n${recentPatterns}` : "",
            ].filter(Boolean).join("\n\n"),
          },
        ];

        const aiResponse = await env.AI.run(
          (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
          { messages, temperature: 0.3, max_tokens: 900 }
        );

        const rawText = (aiResponse as any).response ?? String(aiResponse);
        const parsed = extractJsonObject(rawText) as AlignmentBrief | null;
        const brief = sanitizeBrief(parsed ?? buildEntryFallback());

        return jsonResponse({ ...brief, requestId });
      }

      if (!message) {
        return jsonResponse({ error: "Message is required", requestId }, 400);
      }

      if (message.length > 3000) {
        return jsonResponse({ error: "Message too long. Please keep it under 3000 characters.", requestId }, 400);
      }

      const signalContext = await buildReducedSignalContext(env, user.id, message);
      const messages = [
        { role: "system", content: SYSTEM_ALIGNMENT },
        {
          role: "user",
          content: [
            signalContext ? `Reduced baseline signals:\n${signalContext}` : "No reduced baseline signals available.",
            `Current date: ${dateStr}`,
            `What they are navigating:\n${message}`,
          ].join("\n\n"),
        },
      ];

      const aiResponse = await env.AI.run(
        (env.AI_MODEL || "@cf/meta/llama-3.1-8b-instruct-fast") as any,
        { messages, temperature: 0.3, max_tokens: 700 }
      );

      const rawText = (aiResponse as any).response ?? String(aiResponse);
      const parsed = extractJsonObject(rawText) ?? buildWorkspaceFallback(message);

      return jsonResponse({
        ...parsed,
        media: { audioOverviewAvailable: true },
        requestId,
      });
    } catch (e: any) {
      console.error("Alignment route error:", e);
      if (user && safetyLogger) {
        await safetyLogger.log(
          createSafetyEvent(user.id, "system_error", "medium", {
            error: e?.message || "Unknown error",
            endpoint: "/api/alignment",
          }, { requestId })
        ).catch((err) => console.error("Failed to log safety event:", err));
      }
      return jsonResponse({ error: "Failed to process", requestId }, 500);
    }
  });
}
