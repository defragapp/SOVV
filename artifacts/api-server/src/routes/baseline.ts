import { Router, type Request, type Response } from "express";
import { db, baselines } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// Strict calendar guard — YYYY-MM-DD with no rollover accepted.
// e.g. "2024-02-31" is rejected because Date rolls it to March.
function isValidDateString(val: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
  const [y, m, d] = val.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === m &&
    dt.getUTCDate() === d
  );
}

// ── GET /api/baseline ─────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(baselines).where(eq(baselines.userId, req.userId!)).limit(1);
    if (!row) return res.json(null);
    return res.json({
      dob:            row.dob,
      tob:            row.tob,
      pob:            row.pob,
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
  const body = req.body ?? {};

  const dob = String(body.dob ?? "").trim();
  // Accept both plain string and legacy { type, value } shape from old SettingsPage
  const tobRaw = body.tob;
  const tob = typeof tobRaw === "object" && tobRaw !== null
    ? String(tobRaw.value ?? "").trim()
    : String(tobRaw ?? "").trim();
  const pob = String(body.pob ?? "").trim();

  // Psychological pattern fields (optional; kept for AI context)
  const defaultRetreat = String(body.defaultRetreat ?? "").trim();
  const coreBoundary   = String(body.coreBoundary   ?? "").trim();
  const repairMechanic = String(body.repairMechanic  ?? "").trim();

  // Validate DOB format when provided
  if (dob && !isValidDateString(dob)) {
    return res.status(400).json({ error: "date_of_birth must be YYYY-MM-DD" });
  }

  try {
    const existing = await db.select({ id: baselines.id }).from(baselines)
      .where(eq(baselines.userId, req.userId!)).limit(1);

    // Build update payload — only overwrite fields that were actually sent
    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (dob            !== "") setFields.dob            = dob;
    if (tob            !== "") setFields.tob            = tob;
    if (pob            !== "") setFields.pob            = pob;
    if (defaultRetreat !== "") setFields.defaultRetreat = defaultRetreat;
    if (coreBoundary   !== "") setFields.coreBoundary   = coreBoundary;
    if (repairMechanic !== "") setFields.repairMechanic = repairMechanic;

    if (existing.length > 0) {
      await db.update(baselines).set(setFields).where(eq(baselines.userId, req.userId!));
    } else {
      await db.insert(baselines).values({
        userId: req.userId!,
        dob, tob, pob,
        defaultRetreat, coreBoundary, repairMechanic,
      });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[baseline/POST]", err);
    return res.status(500).json({ error: "Failed to save baseline" });
  }
});

export default router;
