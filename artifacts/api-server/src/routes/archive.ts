import { Router, type Request, type Response } from "express";
import { db, archiveEntries } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ── GET /api/archive ──────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const rows = await db
      .select()
      .from(archiveEntries)
      .where(eq(archiveEntries.userId, req.userId!))
      .orderBy(desc(archiveEntries.createdAt))
      .limit(100);

    return res.json(rows.map(r => ({
      id:                r.id,
      savedAt:           r.createdAt.toISOString().slice(0, 10),
      savedAtFull:       r.createdAt.toISOString(),
      inputText:         r.inputText,
      activePattern:     r.activePattern,
      whatsActive:       r.whatsActive,
      defenseMechanism:  r.defenseMechanism,
      resolutionSteps:   r.resolutionSteps,
      bestNextResponse:  r.bestNextResponse,
      baselineTriggered: r.baselineTriggered,
    })));
  } catch (err) {
    console.error("[archive/GET]", err);
    return res.status(500).json({ error: "Failed to fetch archive" });
  }
});

// ── POST /api/archive ─────────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const {
    inputText        = "",
    activePattern,
    whatsActive,
    defenseMechanism,
    resolutionSteps  = [],
    bestNextResponse,
    baselineTriggered = false,
  } = req.body ?? {};

  if (!activePattern || !whatsActive || !defenseMechanism || !bestNextResponse) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [row] = await db.insert(archiveEntries).values({
      userId:           req.userId!,
      inputText:        String(inputText),
      activePattern:    String(activePattern),
      whatsActive:      String(whatsActive),
      defenseMechanism: String(defenseMechanism),
      resolutionSteps:  Array.isArray(resolutionSteps) ? resolutionSteps : [],
      bestNextResponse: String(bestNextResponse),
      baselineTriggered: Boolean(baselineTriggered),
    }).returning();

    return res.status(201).json({
      id:                row.id,
      savedAt:           row.createdAt.toISOString().slice(0, 10),
      savedAtFull:       row.createdAt.toISOString(),
      activePattern:     row.activePattern,
      whatsActive:       row.whatsActive,
      defenseMechanism:  row.defenseMechanism,
      resolutionSteps:   row.resolutionSteps,
      bestNextResponse:  row.bestNextResponse,
      baselineTriggered: row.baselineTriggered,
    });
  } catch (err) {
    console.error("[archive/POST]", err);
    return res.status(500).json({ error: "Failed to save pattern" });
  }
});

export default router;
