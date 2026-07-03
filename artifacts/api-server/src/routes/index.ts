import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proxyRouter from "./proxy";
import explainRouter from "./explain";
import checkoutRouter from "./checkout";

const router: IRouter = Router();

router.use(healthRouter);

// Local routes — registered BEFORE the proxy so they take precedence
router.use("/explain", explainRouter);
router.use("/checkout", checkoutRouter);

router.use(proxyRouter);

export default router;
