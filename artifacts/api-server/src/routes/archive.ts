import { Router, type Request, type Response } from "express";
import { db, archiveEntries } from "@workspace/db";
import { eq, desc, ilike, or, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ── GET /api/archive ──────────────────────────────────────────────────────────
// Query params: search, space, page (1-based), limit (max 50)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const rawSearch = String(req.query.search ?? "").trim().slice(0, 200);
  const rawSpace  = String(req.query.space  ?? "all").trim();

  // NaN-safe parsing — parseInt("foo") → NaN; Number.isFinite guards the fallback
  const parsedPage  = parseInt(String(req.query.page  ?? "1"), 10);
  const parsedLimit = parseInt(String(req.query.limit ?? "20"), 10);
  const page  = Number.isFinite(parsedPage)  ? Math.max(1, parsedPage)          : 1;
  const limit = Number.isFinite(parsedLimit) ? Math.min(50, Math.max(1, parsedLimit)) : 20;
  const offset = (page - 1) * limit;

  const validSpaces = ["all", "defrag", "covenant", "alignment"] as const;
  const space = validSpaces.includes(rawSpace as typeof validSpaces[number])
    ? rawSpace
    : "all";

  // Escape ILIKE metacharacters so the search term is treated as a literal
  const escapedSearch = rawSearch.replace(/[%_\\]/g, "\\$&");

  const searchCondition = rawSearch
    ? or(
        ilike(archiveEntries.activePattern, `%${escapedSearch}%`),
        ilike(archiveEntries.whatsActive,   `%${escapedSearch}%`),
        ilike(archiveEntries.inputText,     `%${escapedSearch}%`),
      )
    : undefined;

  const spaceCondition = space !== "all"
    ? eq(archiveEntries.space, space)
    : undefined;

  const where = and(
    eq(archiveEntries.userId, req.userId!),
    searchCondition,
    spaceCondition,
  );

  try {
    const [rows, [{ total }]] = await Promise.all([
      db
        .select()
        .from(archiveEntries)
        .where(where)
        .orderBy(desc(archiveEntries.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(archiveEntries)
        .where(where),
    ]);

    const totalNum = Number(total ?? 0);

    return res.json({
      items: rows.map(r => ({
        id:                r.id,
        space:             r.space,
        savedAt:           r.createdAt.toISOString().slice(0, 10),
        savedAtFull:       r.createdAt.toISOString(),
        inputText:         r.inputText,
        activePattern:     r.activePattern,
        whatsActive:       r.whatsActive,
        defenseMechanism:  r.defenseMechanism,
        resolutionSteps:   r.resolutionSteps,
        bestNextResponse:  r.bestNextResponse,
        baselineTriggered: r.baselineTriggered,
      })),
      total:   totalNum,
      page,
      limit,
      hasMore: offset + rows.length < totalNum,
    });
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
    space             = "defrag",
  } = req.body ?? {};

  if (!activePattern || !whatsActive || !defenseMechanism || !bestNextResponse) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const validSpaces = ["defrag", "covenant", "alignment"];
  const safeSpace = validSpaces.includes(String(space)) ? String(space) : "defrag";

  try {
    const [row] = await db.insert(archiveEntries).values({
      userId:           req.userId!,
      space:            safeSpace,
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
      space:             row.space,
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
