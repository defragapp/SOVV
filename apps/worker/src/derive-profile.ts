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

import { IRequest } from "itty-router"
import { getAuthUser, jsonResponse } from "./auth"

// ─── Types ─────────────────────────────────────────────────────────────────────────────────────────────────────

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
  RATE_LIMITER?: RateLimiter
}

// ─── Handler ───────────────────────────────────────────────────────────────────────────────────────────────────

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
  const model = (env.AI_MODEL as BaseAiTextGenerationModels) ?? "@cf/meta/llama-3.1-8b-instruct-fast"
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

  // 5. Parse AI output into BaselineStatement[]
  const statements = parseStatements(aiText)

  if (statements.length === 0) {
    return jsonResponse({ error: "parse_error", message: "Could not parse AI output." }, 500)
  }

  return jsonResponse({ statements }, 200)
}

// ─── Prompt builders ───────────────────────────────────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  return `You are a concise personality profile generator. Given a person's birth data, you return exactly 5 plain-language first-person statements describing their natural tendencies. Each statement is paired with 1–2 brief astrological or Human Design labels.

Rules:
- Write in first person ("I naturally...", "I tend to...", "I feel...", "I notice...")
- Plain, direct English — no metaphors, no spiritual jargon, no abstract poetry
- Each statement describes a real, observable behavioral tendency
- Each statement is 1–2 sentences, max 25 words
- Chips are short labels: e.g. "Sun in Aries", "Gate 51", "Moon in Pisces", "Channel 20-34", "Saturn in Cap."
- Output format: exactly 5 items, each on its own block, formatted as:

STATEMENT: <plain-language first-person statement>
CHIPS: <chip1> | <chip2>

No other text. No numbering. No markdown. No explanation.`
}

function buildUserPrompt(baseline: Baseline): string {
  const { dob, tob, pob } = baseline
  return `Birth data:
Date of birth: ${dob}
Time of birth: ${tob.value} (${tob.type})
Place of birth: ${pob}

Generate 5 plain-language first-person statements with chip labels for this person.`
}

// ─── Output parser ─────────────────────────────────────────────────────────────────────────────────────────────
// Parses the structured STATEMENT / CHIPS block format from AI output.
// Tolerant of minor formatting variations.

function parseStatements(text: string): BaselineStatement[] {
  const results: BaselineStatement[] = []

  // Split on blank lines or by STATEMENT: prefix to find blocks
  const blocks = text.split(/\n(?=STATEMENT:)/i).map(b => b.trim()).filter(Boolean)

  for (const block of blocks) {
    const statementMatch = block.match(/^STATEMENT:\s*(.+?)(?:\n|$)/im)
    const chipsMatch = block.match(/^CHIPS:\s*(.+?)(?:\n|$)/im)

    if (!statementMatch) continue

    const statement = statementMatch[1].trim()
    const chips = chipsMatch
      ? chipsMatch[1].split("|").map(c => c.trim()).filter(Boolean)
      : []

    if (statement) {
      results.push({ statement, chips })
    }
  }

  return results.slice(0, 5)
}

// ─── Route registration helper ─────────────────────────────────────────────────────────────────────────────────
// Called from index.ts: registerDeriveProfileRoute(router, getEnv)

export function registerDeriveProfileRoutes(
  router: any,
  getEnv: (req: IRequest) => Env
) {
  router.get("/api/derive-profile", (req: IRequest) =>
    handleDeriveProfile(req, getEnv(req))
  )
}
