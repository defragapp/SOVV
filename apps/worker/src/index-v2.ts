import legacyWorker from "./index.js"
import type { Env } from "./types-env.js"
import { handleWebhookCompat } from "./billing-webhook-compat.js"
import {
  handleBaselineGuideCheckout,
  handleBaselineGuideVerify,
  handleSupportRedirect,
} from "./commerce.js"

export default {
  ...legacyWorker,

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "POST" && url.pathname === "/api/billing/webhook") {
      return handleWebhookCompat(request, env)
    }

    if (request.method === "POST" && url.pathname === "/api/commerce/baseline-guide/checkout") {
      return handleBaselineGuideCheckout(request, env)
    }

    if (request.method === "GET" && url.pathname === "/api/commerce/baseline-guide/verify") {
      return handleBaselineGuideVerify(request, env)
    }

    if (request.method === "GET" && url.pathname === "/api/commerce/support") {
      return handleSupportRedirect(env)
    }

    return legacyWorker.fetch(request, env, ctx)
  },
}
