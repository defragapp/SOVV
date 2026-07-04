import { Router, type IRouter } from "express";
import healthRouter    from "./health";
import proxyRouter     from "./proxy";
import explainRouter   from "./explain";
import checkoutRouter  from "./checkout";
import authRouter      from "./auth";
import userRouter      from "./user";
import baselineRouter  from "./baseline";
import archiveRouter   from "./archive";
import alignmentRouter from "./alignment";
import covenantsRouter from "./covenants";
import billingRouter   from "./billing";
import webhookRouter   from "./webhook";

const router: IRouter = Router();

router.use(healthRouter);

// ── Local routes — take precedence over proxy ─────────────────────────────────
router.use("/explain",   explainRouter);
router.use("/checkout",  checkoutRouter);
router.use("/auth",      authRouter);
router.use("/user",      userRouter);
router.use("/baseline",  baselineRouter);
router.use("/archive",   archiveRouter);
router.use("/alignment", alignmentRouter);
router.use("/covenants", covenantsRouter);
router.use("/billing",   billingRouter);
router.use("/stripe",    webhookRouter);  // POST /api/stripe/webhook

// ── Upstream proxy — catch-all for anything not handled locally ───────────────
router.use(proxyRouter);

export default router;
