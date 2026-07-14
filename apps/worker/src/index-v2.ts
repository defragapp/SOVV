import legacyWorker from "./index.js"
import type { Env } from "./types-env.js"
import { getAuthUser } from "./auth.js"
import { handleWebhookCompat } from "./billing-webhook-compat.js"
import { handleSupportCheckout } from "./support-checkout.js"
import {
  handleBaselineGuideCheckout,
  handleBaselineGuideDownload,
  handleBaselineGuideVerify,
  handleSupportRedirect,
} from "./commerce.js"

function jsonError(error: string, message: string, status: number): Response {
  return Response.json({ error, message }, { status, headers: { "Cache-Control": "no-store" } })
}

export default {
  ...legacyWorker,

  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === "POST" && url.pathname === "/api/billing/webhook") {
      return handleWebhookCompat(request, env)
    }

    if (request.method === "POST" && url.pathname === "/api/commerce/support/checkout") {
      return handleSupportCheckout(request, env)
    }

    if (request.method === "POST" && url.pathname === "/api/commerce/baseline-guide/checkout") {
      const user = await getAuthUser(request, env.DB)
      if (!user) {
        return jsonError("unauthorized", "Sign in to create a personalized Baseline Guide.", 401)
      }

      const datasetRaw = await env.KV.get(`user-dataset:${user.id}`)
      if (!datasetRaw) {
        return jsonError("baseline_required", "Complete your Baseline Design before purchasing the guide.", 409)
      }

      try {
        const dataset = JSON.parse(datasetRaw) as { status?: string; aiDataset?: unknown }
        if (dataset.status !== "ready" || !dataset.aiDataset) {
          return jsonError("baseline_not_ready", "Your Baseline Design is still being prepared. Try again when it is ready.", 409)
        }
      } catch {
        return jsonError("baseline_invalid", "Your saved Baseline Design needs to be regenerated before checkout.", 409)
      }

      return handleBaselineGuideCheckout(request, env)
    }

    if (request.method === "GET" && url.pathname === "/api/commerce/baseline-guide/verify") {
      return handleBaselineGuideVerify(request, env)
    }

    if (request.method === "GET" && url.pathname === "/api/commerce/baseline-guide/download") {
      return handleBaselineGuideDownload(request, env)
    }

    if (request.method === "GET" && url.pathname === "/api/commerce/support") {
      return handleSupportRedirect(env)
    }

    return legacyWorker.fetch(request, env, ctx)
  },
}
