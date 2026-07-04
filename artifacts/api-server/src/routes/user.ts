import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/auth";
import { countTodayUsage, FREE_DAILY_LIMIT } from "../lib/usage";

const router = Router();

// ── GET /api/user/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json(req.user);
});

// ── GET /api/user/usage ───────────────────────────────────────────────────────
// Session metering for the sidebar counter. Pro = unlimited; free = daily cap.
router.get("/usage", requireAuth, async (req: Request, res: Response) => {
  const tier = req.user?.tier ?? "free";
  const used = await countTodayUsage(req.userId!);

  if (tier === "pro") {
    return res.json({ tier, used, limit: null, remaining: null });
  }
  return res.json({
    tier,
    used,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - used),
  });
});

export default router;
