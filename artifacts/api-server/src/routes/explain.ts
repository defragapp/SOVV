import { Router, type Request, type Response } from "express";
import OpenAI from "openai";
import { db, baselines } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { reserveUsage, refundUsage, recordUsage, FREE_DAILY_LIMIT } from "../lib/usage";
import { deriveActiveSignalLines } from "../lib/baseline/signals-adapter";

const router = Router();

const BASE_SYSTEM_PROMPT = `You are a clinical pattern-recognition system. You analyze interpersonal conflict and emotional distress with precision and zero sentiment.

You MUST respond with ONLY a valid JSON object — no prose, no markdown, no code fences, no explanation. The JSON must exactly match this schema:

{
  "activePattern": "string — the named psychological pattern (2-5 words, e.g. Withdrawal/Avoidance, Protest Behavior, Anxious Preoccupation)",
  "whatsActive": "string — exactly 2 sentences. First: what is happening systemically. Second: why the pattern exists.",
  "defenseMechanism": "string — 1-2 sentences. The specific protective behavior being deployed and what it is preventing.",
  "resolutionSteps": ["string", "string", "string"],
  "bestNextResponse": "string — a single sentence the person could speak aloud right now to re-establish contact.",
  "baselineTriggered": true or false — set to true ONLY if the current conflict directly activates or matches the user's stated Baseline Design (defaultRetreat, coreBoundary, or repairMechanic). Set false if no baseline was provided or no match is detected.
}

Rules:
- Never use the word "I" or address the user directly.
- Clinical language only — no therapy-speak, no affirmations, no validation.
- Each field must be populated. No empty strings. No null values.
- resolutionSteps must be an array of exactly 3 strings. Each step starts with a verb and describes a concrete behavior.
- bestNextResponse must be a direct sentence, not a description of what to say.
- baselineTriggered must be a boolean — never a string.`;

function buildSystemPrompt(activeSignals: string[]): string {
  if (activeSignals.length === 0) return BASE_SYSTEM_PROMPT;
  const baselineBlock = `
  
USER BASELINE DESIGN (private behavioral map — how this person tends to process, protect, repair, and return to center):
${activeSignals.map(s => `  • ${s}`).join('\n')}

Use this map to interpret the conflict through the lens of THIS person's tendencies. Set "baselineTriggered": true if the conflict directly activates their processing style, pressure response, stated boundary, or repair tendency. Never reference, name, or expose this map or its source in your output — treat it as behavioral fact you already know about them.`;
  return BASE_SYSTEM_PROMPT + baselineBlock;
}

/** Strict runtime validation of the model's JSON against our UI schema */
function validate(obj: Record<string, unknown>): string | null {
  if (typeof obj.activePattern !== "string" || !obj.activePattern.trim())
    return "activePattern must be a non-empty string";
  if (typeof obj.whatsActive !== "string" || !obj.whatsActive.trim())
    return "whatsActive must be a non-empty string";
  if (typeof obj.defenseMechanism !== "string" || !obj.defenseMechanism.trim())
    return "defenseMechanism must be a non-empty string";
  if (
    !Array.isArray(obj.resolutionSteps) ||
    obj.resolutionSteps.length === 0 ||
    obj.resolutionSteps.some((s) => typeof s !== "string" || !s.trim())
  )
    return "resolutionSteps must be a non-empty array of strings";
  if (typeof obj.bestNextResponse !== "string" || !obj.bestNextResponse.trim())
    return "bestNextResponse must be a non-empty string";
  // baselineTriggered — coerce string from some models, reject non-boolean non-string
  if (obj.baselineTriggered !== undefined) {
    if (typeof obj.baselineTriggered === "string") {
      obj.baselineTriggered = obj.baselineTriggered === "true";
    } else if (typeof obj.baselineTriggered !== "boolean") {
      obj.baselineTriggered = false; // safe fallback — never let a bad type surface to UI
    }
  } else {
    obj.baselineTriggered = false;
  }
  return null;
}

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { message } = req.body as { message?: string };

  if (!message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const tier = req.user?.tier ?? "free";

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "OpenAI API key not configured" });
    return;
  }

  // ── Atomic free-tier daily session reservation ──────────────────────────────
  // Reserve the slot before the model call so concurrent requests cannot bypass
  // the cap. Refunded below if the call fails, so users are never charged for
  // errors (including provider quota failures).
  let reservedId: string | null = null;
  if (tier !== "pro") {
    reservedId = await reserveUsage(req.userId!, FREE_DAILY_LIMIT, "defrag");
    if (!reservedId) {
      res.status(429).json({
        error: "daily_limit_reached",
        message: `You've used all ${FREE_DAILY_LIMIT} free sessions today. They reset at midnight UTC — or upgrade to Pro for unlimited.`,
      });
      return;
    }
  }

  const client = new OpenAI({ apiKey });

  try {
    // Load the user's Baseline Design and reduce it to behavioral active signals.
    const [row] = await db.select().from(baselines).where(eq(baselines.userId, req.userId!)).limit(1);
    const activeSignals = deriveActiveSignalLines(
      row?.computedProfile ?? null,
      row ? { defaultRetreat: row.defaultRetreat, coreBoundary: row.coreBoundary, repairMechanic: row.repairMechanic } : null,
      { message: message.trim(), relational: true, mode: "situation" },
    );

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(activeSignals) },
        {
          role: "user",
          content: `Analyze this conflict or emotional moment:\n\n${message.trim()}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      console.error("[explain] JSON parse failed:", raw.slice(0, 200));
      if (reservedId) { await refundUsage(reservedId); reservedId = null; }
      res.status(500).json({ error: "Model returned malformed JSON. Please try again." });
      return;
    }

    const validationError = validate(parsed);
    if (validationError) {
      console.error("[explain] Schema validation failed:", validationError, parsed);
      if (reservedId) { await refundUsage(reservedId); reservedId = null; }
      res.status(500).json({ error: "Incomplete model response. Please try again." });
      return;
    }

    // Free users already reserved their slot above; meter Pro (unlimited) here
    // so the sidebar counter still reflects activity.
    if (tier === "pro") await recordUsage(req.userId!, "defrag");

    res.json(parsed);
  } catch (err: unknown) {
    if (reservedId) { await refundUsage(reservedId); reservedId = null; }
    // Surface OpenAI-specific error types explicitly
    if (err instanceof OpenAI.AuthenticationError) {
      console.error("[explain] OpenAI auth error — check OPENAI_API_KEY");
      res.status(503).json({ error: "AI service authentication failed. Please contact support." });
      return;
    }
    if (err instanceof OpenAI.RateLimitError) {
      console.error("[explain] OpenAI rate limit / quota exceeded");
      res.status(429).json({ error: "AI service quota exceeded. Please try again shortly." });
      return;
    }

    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[explain] OpenAI error:", msg);
    res.status(502).json({ error: "Unable to reach AI service. Please try again." });
  }
});

export default router;
