import { Router, type IRouter } from "express";
import healthRouter from "./health";
import proxyRouter from "./proxy";
import explainRouter from "./explain";

const router: IRouter = Router();

router.use(healthRouter);

// Local AI route — must be registered BEFORE the proxy so it takes precedence
router.use("/explain", explainRouter);

router.use(proxyRouter);

export default router;
