import { Router, type Request, type Response } from "express";
import OpenAI from "openai";
import { db, baselines } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { compileBaselineDataset } from "../lib/baseline/compiler";
import { computeBaseline } from "../lib/baseline-engine";

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

/** Time-of-birth is only usable for the astronomy layer when it's a real HH:MM. */
function isExactTime(tob: string): boolean {
  return /^\d{2}:\d{2}$/.test(tob.trim());
}

/**
 * Background compile — runs after the POST response is sent (fire-and-forget;
 * safe in a long-running Node process). Calls external ephemeris/geocoding + AI,
 * then writes the result back. Guarded so a newer save can't be clobbered by a
 * slower in-flight compile of stale birth data.
 */
async function runBaselineCompile(
  userId: string,
  input: { dob: string; tob: string; pob: string },
): Promise<void> {
  const apiKey = process.env["OPENAI_API_KEY"];
  const tobExact = isExactTime(input.tob);

  try {
    let computedProfile: unknown;
    // "degraded" = usable behavioral signals but not the full rich compile
    // (deterministic fallback, or partial framework data).
    let status: "ready" | "degraded" | "failed";

    if (!apiKey) {
      // No AI available — degrade to the deterministic engine so the user still
      // gets date-level behavioral signals rather than an empty baseline.
      computedProfile = computeBaseline({ dob: input.dob, tob: input.tob });
      status = "degraded";
    } else {
      const client = new OpenAI({ apiKey });
      const dataset = await compileBaselineDataset(
        {
          dob: input.dob,
          tob: tobExact ? input.tob : "12:00", // noon fallback keeps the ephemeris query valid
          tobType: tobExact ? "exact" : "approx",
          pob: input.pob,
        },
        client,
        "gpt-4o",
      );

      if (dataset.status === "failed") {
        // Rich compile failed outright — fall back to deterministic signals.
        computedProfile = computeBaseline({ dob: input.dob, tob: input.tob });
        status = "degraded";
      } else {
        computedProfile = dataset;
        // No astronomy layer means the ephemeris was unavailable — signals are
        // real but thinner, so report it honestly as degraded rather than ready.
        status = dataset.astronomy ? "ready" : "degraded";
      }
    }

    // Write back only if the birth data we compiled from is still current.
    await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
      const [current] = await tx.select().from(baselines).where(eq(baselines.userId, userId)).limit(1);
      if (!current) return;
      // A newer save superseded this compile — drop the stale result.
      if (current.dob !== input.dob || current.tob !== input.tob || current.pob !== input.pob) return;

      await tx.update(baselines).set({
        computedProfile,
        baselineStatus: status,       // "ready" | "degraded" — failures handled in catch below
        computedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(baselines.userId, userId));
    });
  } catch (err) {
    console.error("[baseline/compile]", err);
    try {
      await db.transaction(async (tx) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${userId}))`);
        const [current] = await tx.select().from(baselines).where(eq(baselines.userId, userId)).limit(1);
        if (!current) return;
        if (current.dob !== input.dob || current.tob !== input.tob || current.pob !== input.pob) return;
        await tx.update(baselines).set({
          baselineStatus: "failed",
          computedAt: null,
          updatedAt: new Date(),
        }).where(eq(baselines.userId, userId));
      });
    } catch (writeErr) {
      console.error("[baseline/compile] failed to record failure", writeErr);
    }
  }
}

// ── GET /api/baseline ─────────────────────────────────────────────────────────
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db.select().from(baselines).where(eq(baselines.userId, req.userId!)).limit(1);
    if (!row) return res.json(null);
    return res.json({
      dob:             row.dob,
      tob:             row.tob,
      pob:             row.pob,
      defaultRetreat:  row.defaultRetreat,
      coreBoundary:    row.coreBoundary,
      repairMechanic:  row.repairMechanic,
      computedProfile: row.computedProfile,
      baselineStatus:  row.baselineStatus,
      computedAt:      row.computedAt,
      updatedAt:       row.updatedAt,
    });
  } catch (err) {
    console.error("[baseline/GET]", err);
    return res.status(500).json({ error: "Failed to fetch baseline" });
  }
});

// ── GET /api/baseline/status — lightweight polling endpoint ────────────────────
router.get("/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const [row] = await db
      .select({ baselineStatus: baselines.baselineStatus, computedAt: baselines.computedAt })
      .from(baselines)
      .where(eq(baselines.userId, req.userId!))
      .limit(1);

    // Normalize internal "not_started" → the public "none".
    const raw = row?.baselineStatus ?? "not_started";
    const status = raw === "not_started" ? "none" : raw; // none | pending | ready | degraded | failed
    return res.json({
      status,
      computedAt: row?.computedAt ? row.computedAt.toISOString() : null,
    });
  } catch (err) {
    console.error("[baseline/status]", err);
    return res.status(500).json({ error: "Failed to fetch baseline status" });
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

  // Psychological pattern fields (optional; the self-reported calibration layer)
  const defaultRetreat = String(body.defaultRetreat ?? "").trim();
  const coreBoundary   = String(body.coreBoundary   ?? "").trim();
  const repairMechanic = String(body.repairMechanic  ?? "").trim();

  // Validate DOB format when provided
  if (dob && !isValidDateString(dob)) {
    return res.status(400).json({ error: "date_of_birth must be YYYY-MM-DD" });
  }

  try {
    // Serialize per-user so a concurrent partial update can't race the merge.
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${req.userId!}))`);

      const [existing] = await tx.select().from(baselines)
        .where(eq(baselines.userId, req.userId!)).limit(1);

      // Effective birth data after merge — only sent fields overwrite existing ones.
      const effDob = dob !== "" ? dob : existing?.dob ?? "";
      const effTob = tob !== "" ? tob : existing?.tob ?? "";
      const effPob = pob !== "" ? pob : existing?.pob ?? "";

      // Without a DOB there's nothing to compile — keep it un-started.
      const willCompile = effDob !== "";
      const status = willCompile ? "pending" : "not_started";

      // Reset computed layer to a pending stub; the background job fills it in.
      const setFields: Record<string, unknown> = {
        updatedAt:       new Date(),
        computedProfile: willCompile
          ? { version: "baseline.v2", status: "pending", input: { dob: effDob, tob: effTob, pob: effPob } }
          : null,
        baselineStatus:  status,
        computedAt:      null,
      };
      if (dob            !== "") setFields.dob            = dob;
      if (tob            !== "") setFields.tob            = tob;
      if (pob            !== "") setFields.pob            = pob;
      if (defaultRetreat !== "") setFields.defaultRetreat = defaultRetreat;
      if (coreBoundary   !== "") setFields.coreBoundary   = coreBoundary;
      if (repairMechanic !== "") setFields.repairMechanic = repairMechanic;

      if (existing) {
        await tx.update(baselines).set(setFields).where(eq(baselines.userId, req.userId!));
      } else {
        await tx.insert(baselines).values({
          userId: req.userId!,
          dob, tob, pob,
          defaultRetreat, coreBoundary, repairMechanic,
          computedProfile: setFields.computedProfile,
          baselineStatus:  status,
          computedAt:      null,
        });
      }
      return { status, effDob, effTob, effPob, willCompile };
    });

    // Kick off the compile AFTER the response commits (fire-and-forget).
    if (result.willCompile) {
      void runBaselineCompile(req.userId!, { dob: result.effDob, tob: result.effTob, pob: result.effPob });
    }

    return res.json({ ok: true, baselineStatus: result.status });
  } catch (err) {
    console.error("[baseline/POST]", err);
    return res.status(500).json({ error: "Failed to save baseline" });
  }
});

export default router;
