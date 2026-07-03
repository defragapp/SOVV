import { Router, type Request, type Response } from "express";
import { requireAuth } from "../middlewares/auth";

const router = Router();

// ── GET /api/user/me ──────────────────────────────────────────────────────────
router.get("/me", requireAuth, (req: Request, res: Response) => {
  return res.json(req.user);
});

export default router;
