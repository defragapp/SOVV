import { Router } from "itty-router";
import type { Env } from "./types-env.js";
import { registerAuthRoutes } from "./auth.js";
import { registerBaselineRoutes } from "./baseline.js";
import { registerBillingRoutes } from "./billing.js";
import { registerChipsRoute } from "./chips.js";
import { registerExplainRoute } from "./explain-extended.js";
import { registerHistoryRoute } from "./history.js";
import { registerPatternsRoutes } from "./patterns.js";
import { extractPatterns } from "./patterns.js";

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



  async queue(
    batch: MessageBatch<unknown>,
    env: Env,
    _ctx: ExecutionContext
  ): Promise<void> {
    for (const message of batch.messages) {
      const body = message.body as { sessionId?: string; interactionId?: string };
      const sessionId = body?.sessionId;
      const interactionId = body?.interactionId;

      if (!sessionId || !interactionId) {
        console.error("Queue: invalid message body");
        message.ack(); // don't retry malformed messages
        continue;
      }

      try {
        await extractPatterns(env, sessionId, interactionId);
        message.ack();
      } catch (err) {
        console.error("Queue: pattern extraction failed for", interactionId, err);
        message.retry();
      }
    }
  },
} satisfies ExportedHandler<Env>;