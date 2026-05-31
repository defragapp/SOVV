import { Router } from "itty-router";
import type { Env } from "./types-env";
import { registerAuthRoutes } from "./auth";
import { registerBaselineRoutes } from "./baseline";
import { registerBillingRoutes } from "./billing";
import { registerChipsRoute } from "./chips";
import { registerExplainRoute } from "./explain-extended";
import { registerHistoryRoute } from "./history";
import { registerPatternsRoutes } from "./patterns";

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
