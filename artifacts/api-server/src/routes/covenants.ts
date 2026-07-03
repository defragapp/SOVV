import { Router, type Request, type Response } from "express";
import { db, covenants } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

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
