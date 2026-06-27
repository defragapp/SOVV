// @ts-nocheck
/**
 * derive-profile.ts
 * GET /api/derive-profile
 *
 * Reads the session baseline from KV, uses CF Workers AI to compute
 * astrological placements + Human Design gate/channel associations,
 * and returns 5 plain-language first-person BaselineStatement objects.
 *
 * Response shape:
 *   { statements: BaselineStatement[] }
 *
 *   BaselineStatement = { statement: string; chips: string[] }
 *
 * Tone rules (hard):
 *   - Plain-language, first-person
 *   - Antistigma, no metaphor, universally legible
 *   - No jargon unless it's inside a chip label (e.g. "Gate 51")
 */

import type { IRequest } from "itty-router"
import { getAuthUser, jsonResponse } from "./auth.js"

// ─── Types ─────────────────────────────────────────────────────────────────

interface Baseline {
  dob: string
  tob: { type: "exact" | "approx"; value: string }
  pob: string
}

export interface BaselineStatement {
  statement: string
  chips: string[]
}

// Matches the Env binding shape used across the worker
interface Env {
  DB: D1Database
  KV: KVNamespace
  AI: Ai
  AI_MODEL?: string
  RATE_LIMITER?: { limit: (opts: { key: string }) => Promise<{ success: boolean }> }
}

// ─── Handler ───────────────────────────────────────────────────────────────

export async function handleDeriveProfile(
  request: IRequest,
  env: Env
): Promise<Response> {
  // 1. Auth — session required
  const authUser = await getAuthUser(request as unknown as Request, env.DB)
  if (!authUser) {
    return jsonResponse({ error: "Unauthorized" }, 401)
  }

  // 2. Read baseline from KV — key format matches baseline.ts
  const kvKey = `baseline:${authUser.id}`
  const raw = await env.KV.get(kvKey)
  if (!raw) {
    return jsonResponse({ error: "no_baseline", message: "No baseline found. Add birth data first." }, 404)
  }

  let baseline: Baseline
  try {
    baseline = JSON.parse(raw) as Baseline
  } catch {
    return jsonResponse({ error: "invalid_baseline" }, 500)
  }

  // 3. Build prompt for AI
  const model = (env.AI_MODEL as any) ?? "@cf/meta/llama-3.1-8b-instruct-fast"
  const systemPrompt = buildSystemPrompt()
  const userPrompt = buildUserPrompt(baseline)

  // 4. Call AI
  let aiText = ""
  try {
    const aiResponse = await env.AI.run(model, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    })

    // CF Workers AI returns { response: string } for chat models
    aiText = typeof aiResponse === "object" && "response" in aiResponse
      ? (aiResponse as { response: string }).response
      : ""
  } catch (err) {
    console.error("[derive-profile] AI error:", err)
    return jsonResponse({ error: "ai_error", message: "Failed to generate profile." }, 500)
  }

  // 5. Parse structured output
  const statements = parseStatements(aiText)

  return jsonResponse({ statements })
}

// ─── Prompt builders ───────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a data interpreter for a personal intelligence platform called Sovereign.
Your job is to translate a person's birth data (date, time, place) into exactly 5 plain-language
first-person tendency statements that describe how they naturally operate.

Rules:
- Write in first person: "I naturally..." or "I tend to..." or "I'm someone who..."
- Each statement must be instantly understandable to any adult, no astrology or Human Design jargon in the statement text
- Each statement must be specific and grounded — not vague or generic
- Each statement must be paired with 1–3 chip labels (e.g. "Sun in Aries", "Gate 51", "Channel 25-51") that show which data point produced it
- Chip labels may use system terminology since they are data labels, not prose
- No metaphors. No spiritual language. No diagnostic framing. No abstract descriptions.
- Tone: direct, clear, antistigma, universally legible

Output format — repeat exactly 5 times, no extra text:
STATEMENT: [first-person plain-language tendency]
CHIPS: [comma-separated chip labels]
---`
}

function buildUserPrompt(baseline: Baseline): string {
  const dob = baseline.dob
  const tob = baseline.tob.value
  const tobType = baseline.tob.type === "approx" ? " (approximate)" : ""
  const pob = baseline.pob
  return `Birth data:
Date of birth: ${dob}
Time of birth: ${tob}${tobType}
Place of birth: ${pob}

Generate 5 plain-language tendency statements for this person based on their birth data.`
}

// ─── Parser ────────────────────────────────────────────────────────────────

function parseStatements(text: string): BaselineStatement[] {
  const blocks = text.split("---").map(b => b.trim()).filter(Boolean)
  const statements: BaselineStatement[] = []

  for (const block of blocks) {
    const statementMatch = block.match(/STATEMENT:\s*(.+)/s)
    const chipsMatch = block.match(/CHIPS:\s*(.+)/s)

    if (!statementMatch || !chipsMatch) continue

    const statement = statementMatch[1]
      .replace(/CHIPS:.*/s, "")
      .trim()
      .replace(/\n/g, " ")

    const chips = chipsMatch[1]
      .replace(/---.*$/s, "")
      .split(",")
      .map(c => c.trim())
      .filter(Boolean)

    if (statement && chips.length > 0) {
      statements.push({ statement, chips })
    }

    if (statements.length === 5) break
  }

  return statements
}

// ─── Route registration ────────────────────────────────────────────────────

export function registerDeriveProfileRoutes(router: any, getEnv: () => Env) {
  router.get("/api/derive-profile", (request: IRequest) =>
    handleDeriveProfile(request, getEnv())
  )
}
