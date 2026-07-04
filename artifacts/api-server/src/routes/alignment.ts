import { Router, type Request, type Response } from "express";
import OpenAI from "openai";
import { db, baselines, archiveEntries, alignmentEntries } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { toActiveSignals, type BaselineProfile } from "../lib/baseline-engine";

const router = Router();

// ── AI prompt ─────────────────────────────────────────────────────────────────

function buildAlignmentPrompt(
  activeSignals: string[],
  recentPatterns: Array<{ activePattern: string; whatsActive: string; bestNextResponse: string }>,
  personName: string,
): string {
  const baselineBlock = activeSignals.length > 0
    ? `USER BASELINE DESIGN (private behavioral map — how this person tends to process, protect, and repair):
${activeSignals.map(s => `• ${s}`).join("\n")}

Never reference or expose this map's source; treat it as behavioral fact.`
    : "USER BASELINE DESIGN: Not yet established.";

  const patternsBlock =
    recentPatterns.length > 0
      ? `RECENT DEFRAG PATTERNS (most recent first):\n${recentPatterns
          .map((p, i) => `${i + 1}. Pattern: "${p.activePattern}" — ${p.whatsActive}`)
          .join("\n")}`
      : "RECENT DEFRAG PATTERNS: None recorded yet.";

  return `You are a relational alignment engine. You generate response vectors for interpersonal dynamics.

${baselineBlock}

${patternsBlock}

RELATIONAL CONTEXT: The user is working on their dynamic with "${personName}".

Based on the above, generate an alignment vector. "Their Pattern" describes the behavioral pattern active in this dynamic (from the other side, or the user's own pattern if working on Self). "Your Response" describes what is available to the user — what belongs to them to carry and act on. "Your Action" is the single cleanest concrete move.

Respond with ONLY valid JSON — no markdown, no prose, no code fences:
{
  "theirPattern": "2-3 sentences. Clinical description of the pattern active in the dynamic. If person is Self, describe the user's own default pattern.",
  "yourResponse": "2-3 sentences. The aligned response — what is the user's to carry, where the opening is.",
  "yourAction": "One sentence beginning with a verb. The single cleaner move right now."
}`;
}

// ── GET /api/alignment/status?personId=self ───────────────────────────────────
router.get("/status", requireAuth, async (req: Request, res: Response) => {
  const rawPersonId = req.query.personId;
  if (rawPersonId !== undefined && (typeof rawPersonId !== "string" || !rawPersonId.trim())) {
    return res.status(400).json({ error: "personId must be a non-empty string" });
  }
  const personId = rawPersonId ? rawPersonId.trim().slice(0, 128) : "self";

  try {
    const [entry] = await db
      .select()
      .from(alignmentEntries)
      .where(
        and(
          eq(alignmentEntries.userId, req.userId!),
          eq(alignmentEntries.personId, personId),
        ),
      )
      .orderBy(desc(alignmentEntries.createdAt))
      .limit(1);

    if (!entry) return res.json({ committed: false });

    return res.json({
      committed: true,
      id:           entry.id,
      personId:     entry.personId,
      personName:   entry.personName,
      theirPattern: entry.theirPattern,
      yourResponse: entry.yourResponse,
      yourAction:   entry.yourAction,
      committedAt:  entry.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[alignment/status]", err);
    return res.status(500).json({ error: "Failed to load alignment status" });
  }
});

// ── POST /api/alignment/generate ──────────────────────────────────────────────
router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  const rawPersonId   = req.body?.personId;
  const rawPersonName = req.body?.personName;

  if (rawPersonId !== undefined && (typeof rawPersonId !== "string" || !String(rawPersonId).trim())) {
    return res.status(400).json({ error: "personId must be a non-empty string" });
  }
  if (rawPersonName !== undefined && (typeof rawPersonName !== "string" || !String(rawPersonName).trim())) {
    return res.status(400).json({ error: "personName must be a non-empty string" });
  }

  const personId   = (typeof rawPersonId   === "string" ? rawPersonId.trim()   : "self").slice(0, 128);
  const personName = (typeof rawPersonName === "string" ? rawPersonName.trim() : "Self").slice(0, 128);

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    // Load baseline + recent patterns in parallel
    const [baselineRows, patternRows] = await Promise.all([
      db.select().from(baselines).where(eq(baselines.userId, req.userId!)).limit(1),
      db
        .select({
          activePattern:    archiveEntries.activePattern,
          whatsActive:      archiveEntries.whatsActive,
          bestNextResponse: archiveEntries.bestNextResponse,
        })
        .from(archiveEntries)
        .where(eq(archiveEntries.userId, req.userId!))
        .orderBy(desc(archiveEntries.createdAt))
        .limit(5),
    ]);

    const baseline = baselineRows[0] ?? null;
    const activeSignals = toActiveSignals(
      (baseline?.computedProfile as BaselineProfile | null) ?? null,
      baseline ? { defaultRetreat: baseline.defaultRetreat, coreBoundary: baseline.coreBoundary, repairMechanic: baseline.repairMechanic } : null,
    );
    const hasContext = activeSignals.length > 0 || patternRows.length > 0;

    if (!hasContext) {
      return res.status(422).json({
        code: "NO_PATTERNS",
        error:
          "No baseline design or Defrag patterns found. Complete a Defrag session first to build context.",
      });
    }

    const client = new OpenAI({ apiKey });
    const systemPrompt = buildAlignmentPrompt(activeSignals, patternRows, String(personName));

    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      max_tokens:      512,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: "Generate the alignment vector now." },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      console.error("[alignment/generate] JSON parse failed:", raw.slice(0, 200));
      return res.status(500).json({ error: "Model returned malformed JSON. Please try again." });
    }

    const { theirPattern, yourResponse, yourAction } = parsed;
    if (
      typeof theirPattern !== "string" || !theirPattern.trim() ||
      typeof yourResponse !== "string" || !yourResponse.trim() ||
      typeof yourAction   !== "string" || !yourAction.trim()
    ) {
      console.error("[alignment/generate] Schema validation failed:", parsed);
      return res.status(500).json({ error: "Incomplete model response. Please try again." });
    }

    return res.json({ theirPattern, yourResponse, yourAction });
  } catch (err: unknown) {
    if (err instanceof OpenAI.AuthenticationError) {
      return res.status(503).json({ error: "AI service authentication failed." });
    }
    if (err instanceof OpenAI.RateLimitError) {
      return res.status(429).json({ error: "AI service quota exceeded. Please try again shortly." });
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[alignment/generate] error:", msg);
    return res.status(502).json({ error: "Unable to reach AI service. Please try again." });
  }
});

// ── POST /api/alignment/commit ────────────────────────────────────────────────
router.post("/commit", requireAuth, async (req: Request, res: Response) => {
  const body = req.body ?? {};

  if (body.personId !== undefined && (typeof body.personId !== "string" || !String(body.personId).trim())) {
    return res.status(400).json({ error: "personId must be a non-empty string" });
  }
  if (body.personName !== undefined && (typeof body.personName !== "string" || !String(body.personName).trim())) {
    return res.status(400).json({ error: "personName must be a non-empty string" });
  }

  const personId     = (typeof body.personId   === "string" ? body.personId.trim()   : "self").slice(0, 128);
  const personName   = (typeof body.personName === "string" ? body.personName.trim() : "Self").slice(0, 128);
  const theirPattern = typeof body.theirPattern === "string" ? body.theirPattern.trim() : "";
  const yourResponse = typeof body.yourResponse === "string" ? body.yourResponse.trim() : "";
  const yourAction   = typeof body.yourAction   === "string" ? body.yourAction.trim()   : "";

  if (!theirPattern || !yourResponse || !yourAction) {
    return res.status(400).json({ error: "Missing required fields: theirPattern, yourResponse, yourAction must be non-empty strings" });
  }
  if (theirPattern.length > 2000 || yourResponse.length > 2000 || yourAction.length > 500) {
    return res.status(400).json({ error: "Field length exceeds maximum" });
  }

  try {
    const [row] = await db
      .insert(alignmentEntries)
      .values({
        userId:       req.userId!,
        personId:     String(personId),
        personName:   String(personName),
        theirPattern: String(theirPattern),
        yourResponse: String(yourResponse),
        yourAction:   String(yourAction),
      })
      .returning();

    return res.status(201).json({
      committed:    true,
      id:           row.id,
      personId:     row.personId,
      personName:   row.personName,
      theirPattern: row.theirPattern,
      yourResponse: row.yourResponse,
      yourAction:   row.yourAction,
      committedAt:  row.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[alignment/commit]", err);
    return res.status(500).json({ error: "Failed to commit alignment vector" });
  }
});

export default router;
