import { Router, type Request, type Response } from "express";
import OpenAI from "openai";
import { db, covenants, baselines, archiveEntries } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { toActiveSignals, type BaselineProfile } from "../lib/baseline-engine";

const router = Router();

// ── POST /api/covenants/suggest ───────────────────────────────────────────────
router.post("/suggest", requireAuth, async (req: Request, res: Response) => {
  const rawRelationship = req.body?.relationship;
  const rawDynamic      = req.body?.dynamic;

  if (!rawRelationship || typeof rawRelationship !== "string" || !rawRelationship.trim()) {
    return res.status(400).json({ error: "relationship is required and must be a non-empty string" });
  }
  if (rawDynamic !== undefined && typeof rawDynamic !== "string") {
    return res.status(400).json({ error: "dynamic must be a string" });
  }

  const relationship = rawRelationship.trim().slice(0, 128);
  const dynamic      = (rawDynamic as string | undefined)?.trim().slice(0, 1000) ?? "";

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) return res.status(500).json({ error: "OpenAI API key not configured" });

  try {
    // Load baseline + recent archive patterns in parallel
    const [baselineRows, patternRows] = await Promise.all([
      db.select().from(baselines).where(eq(baselines.userId, req.userId!)).limit(1),
      db
        .select({ activePattern: archiveEntries.activePattern, whatsActive: archiveEntries.whatsActive })
        .from(archiveEntries)
        .where(eq(archiveEntries.userId, req.userId!))
        .orderBy(desc(archiveEntries.createdAt))
        .limit(4),
    ]);

    const baseline = baselineRows[0] ?? null;
    const activeSignals = toActiveSignals(
      (baseline?.computedProfile as BaselineProfile | null) ?? null,
      baseline ? { defaultRetreat: baseline.defaultRetreat, coreBoundary: baseline.coreBoundary, repairMechanic: baseline.repairMechanic } : null,
    );

    const baselineBlock = activeSignals.length > 0
      ? `USER BASELINE (private behavioral map):\n${activeSignals.map(s => `• ${s}`).join("\n")}`
      : "";

    const patternsBlock = patternRows.length > 0
      ? `RECENT PATTERNS:\n${patternRows.map(p => `• ${p.activePattern}: ${p.whatsActive}`).join("\n")}`
      : "";

    const contextBlock = [baselineBlock, patternsBlock, dynamic ? `DYNAMIC NOTES: "${dynamic}"` : ""]
      .filter(Boolean)
      .join("\n\n");

    const systemPrompt = `You draft structural relational boundary statements. A structural boundary is clear, declarative, and describes exactly what the user will do (not feel) when the pattern activates — it is not a request, an ultimatum, or emotional language.

Output ONLY valid JSON with a single field: { "boundary": "string" }

The boundary string must be 1-3 sentences. It must:
- State the specific condition that activates the boundary
- State the concrete behavioral response the user will take
- Use first-person, present tense ("When X, I will Y")
- Be neutral in tone — no blame, no hope, no judgment

No markdown. No explanation. Only the JSON object.`;

    const userMessage = `Relationship: "${relationship}"${contextBlock ? `\n\n${contextBlock}` : ""}

Draft a structural boundary for this relationship.`;

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model:           "gpt-4o",
      max_tokens:      256,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userMessage },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      console.error("[covenant/suggest] JSON parse failed:", raw.slice(0, 200));
      return res.status(500).json({ error: "Model returned malformed JSON. Please try again." });
    }

    const boundary = parsed.boundary;
    if (typeof boundary !== "string" || !boundary.trim()) {
      console.error("[covenant/suggest] Schema validation failed:", parsed);
      return res.status(500).json({ error: "Incomplete model response. Please try again." });
    }

    const trimmed = boundary.trim().slice(0, 800); // hard cap — model outliers fail deterministically
    return res.json({ boundary: trimmed });
  } catch (err: unknown) {
    if (err instanceof OpenAI.AuthenticationError) {
      return res.status(503).json({ error: "AI service authentication failed." });
    }
    if (err instanceof OpenAI.RateLimitError) {
      return res.status(429).json({ error: "AI service quota exceeded. Please try again shortly." });
    }
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[covenant/suggest] error:", msg);
    return res.status(502).json({ error: "Unable to reach AI service. Please try again." });
  }
});

// ── GET /api/covenants ────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(covenants)
      .where(eq(covenants.userId, req.userId!))
      .orderBy(desc(covenants.createdAt))
      .limit(200);

    return res.json(rows.map(r => ({
      id:              r.id,
      title:           r.title,
      type:            r.type,
      withWhom:        r.withWhom,
      boundary:        r.boundary,
      costOfViolation: r.costOfViolation,
      sealed:          r.sealed,
      createdAt:       r.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error("[covenants/GET]", err);
    return res.status(500).json({ error: "Failed to fetch covenants" });
  }
});

// ── POST /api/covenants ───────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const {
    title, type, withWhom, boundary, sealed,
    costOfViolation = "",   // optional — UI may not collect it
  } = req.body ?? {};

  if (!title || !type || !withWhom || !boundary || !sealed) {
    return res.status(400).json({ error: "Required covenant fields are missing" });
  }

  try {
    const [row] = await db.insert(covenants).values({
      userId:          req.userId!,
      title:           String(title),
      type:            String(type),
      withWhom:        String(withWhom),
      boundary:        String(boundary),
      costOfViolation: String(costOfViolation),
      sealed:          String(sealed),
    }).returning();

    return res.status(201).json({
      id:              row.id,
      title:           row.title,
      type:            row.type,
      withWhom:        row.withWhom,
      boundary:        row.boundary,
      costOfViolation: row.costOfViolation,
      sealed:          row.sealed,
      createdAt:       row.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("[covenants/POST]", err);
    return res.status(500).json({ error: "Failed to create covenant" });
  }
});

// ── DELETE /api/covenants/:id ─────────────────────────────────────────────────
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = String(req.params['id']);
  try {
    const deleted = await db.delete(covenants)
      .where(and(eq(covenants.id, id), eq(covenants.userId, req.userId!)))
      .returning({ id: covenants.id });

    if (deleted.length === 0) return res.status(404).json({ error: "Covenant not found" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("[covenants/DELETE]", err);
    return res.status(500).json({ error: "Failed to delete covenant" });
  }
});

export default router;
