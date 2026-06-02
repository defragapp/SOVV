import { Router } from "itty-router";
import type { Env } from "./types-env.js";
import { registerAuthRoutes } from "./auth.js";
import { registerBaselineRoutes } from "./baseline.js";
import { registerBillingRoutes } from "./billing.js";
import { registerChipsRoute } from "./chips.js";
import { registerExplainRoute } from "./explain-extended.js";
import { registerHistoryRoute } from "./history.js";
import { registerPatternsRoutes } from "./patterns.js";

const router = Router();
let currentEnv: Env;

const getEnv = () => currentEnv;

registerAuthRoutes(router, getEnv);
registerBaselineRoutes(router, getEnv);
registerBillingRoutes(router, getEnv);
registerChipsRoute(router, getEnv);
registerExplainRoute(router, getEnv);
registerHistoryRoute(router, getEnv);
registerPatternsRoutes(router, getEnv);

router.all("*", () => new Response("Not Found", { status: 404 }));

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    currentEnv = env;
    return router.handle(request, env, ctx);
  },
};
