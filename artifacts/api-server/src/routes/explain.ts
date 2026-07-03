import { Router, type Request, type Response } from "express";
import OpenAI from "openai";

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

interface BaselineData {
  defaultRetreat?: string;
  coreBoundary?: string;
  repairMechanic?: string;
}

function buildSystemPrompt(baseline: BaselineData | null): string {
  if (!baseline || (!baseline.defaultRetreat && !baseline.coreBoundary && !baseline.repairMechanic)) {
    return BASE_SYSTEM_PROMPT;
  }
  const parts: string[] = [];
  if (baseline.defaultRetreat?.trim()) parts.push(`Default Retreat: "${baseline.defaultRetreat.trim()}"`);
  if (baseline.coreBoundary?.trim()) parts.push(`Core Boundary: "${baseline.coreBoundary.trim()}"`);
  if (baseline.repairMechanic?.trim()) parts.push(`Repair Mechanic: "${baseline.repairMechanic.trim()}"`);
  const baselineBlock = `
  
USER BASELINE DESIGN (established relational patterns for this user):
${parts.map(p => `  • ${p}`).join('\n')}

When analyzing the conflict, evaluate it against this Baseline Design. Set "baselineTriggered": true if the conflict directly activates their default retreat, violates their core boundary, or bypasses their repair mechanic.`;
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

router.post("/", async (req: Request, res: Response) => {
  const { message, baseline } = req.body as { message?: string; baseline?: BaselineData };

  if (!message?.trim()) {
    res.status(400).json({ error: "message is required" });
    return;
  }

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    res.status(500).json({ error: "OpenAI API key not configured" });
    return;
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildSystemPrompt(baseline ?? null) },
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
      res.status(500).json({ error: "Model returned malformed JSON. Please try again." });
      return;
    }

    const validationError = validate(parsed);
    if (validationError) {
      console.error("[explain] Schema validation failed:", validationError, parsed);
      res.status(500).json({ error: "Incomplete model response. Please try again." });
      return;
    }

    res.json(parsed);
  } catch (err: unknown) {
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
