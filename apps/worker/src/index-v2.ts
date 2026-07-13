import legacyWorker from "./index.js"
import type { Env } from "./types-env.js"
import { handleWebhookCompat } from "./billing-webhook-compat.js"

export default {
  ...legacyWorker,

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (request.method === "POST" && url.pathname === "/api/billing/webhook") {
      return handleWebhookCompat(request, env)
    }
    return legacyWorker.fetch(request, env, ctx)
  },
}
