import { Router } from "itty-router";
import type { Env } from "./types-env.ts";
import { registerAuthRoutes } from "./auth.ts";
import { registerBaselineRoutes } from "./baseline.ts";
import { registerBillingRoutes } from "./billing.ts";
import { registerChipsRoute } from "./chips.ts";
import { registerExplainRoute } from "./explain-extended.ts";
import { registerHistoryRoute } from "./history.ts";
import { registerPatternsRoutes } from "./patterns.ts";

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
