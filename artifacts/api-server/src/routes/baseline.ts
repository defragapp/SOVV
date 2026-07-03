import { Router, type Request, type Response } from "express";
import { db, baselines } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ── GET /api/baseline ─────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(baselines).where(eq(baselines.userId, req.userId!)).limit(1);
    if (!row) return res.json(null);
    return res.json({
      defaultRetreat: row.defaultRetreat,
      coreBoundary:   row.coreBoundary,
      repairMechanic: row.repairMechanic,
      updatedAt:      row.updatedAt,
    });
  } catch (err) {
    console.error("[baseline/GET]", err);
    return res.status(500).json({ error: "Failed to fetch baseline" });
  }
});

// ── POST /api/baseline ────────────────────────────────────────────────────────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { defaultRetreat = "", coreBoundary = "", repairMechanic = "" } = req.body ?? {};

  try {
    const existing = await db.select({ id: baselines.id }).from(baselines).where(eq(baselines.userId, req.userId!)).limit(1);

    if (existing.length > 0) {
      await db.update(baselines).set({
        defaultRetreat: String(defaultRetreat),
        coreBoundary:   String(coreBoundary),
        repairMechanic: String(repairMechanic),
        updatedAt:      new Date(),
      }).where(eq(baselines.userId, req.userId!));
    } else {
      await db.insert(baselines).values({
        userId:         req.userId!,
        defaultRetreat: String(defaultRetreat),
        coreBoundary:   String(coreBoundary),
        repairMechanic: String(repairMechanic),
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[baseline/POST]", err);
    return res.status(500).json({ error: "Failed to save baseline" });
  }
});

export default router;
