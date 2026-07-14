import legacyBroker from "./index.js"
import { handleRepoApplyPatch, handleRepoDiff } from "./repo-patch-runtime.js"

function authorized(request, env) {
  const token = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim()
  return Boolean(env.BROKER_TOKEN) && token === env.BROKER_TOKEN
}

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
  },
})

async function withBrokerDiagnostics(response) {
  const headers = new Headers(response.headers)
  headers.set("X-Sovereign-Broker", "sovereign-dev-v3")
  headers.set("X-Sovereign-Entrypoint", "index-v4")
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    if (request.method === "OPTIONS") return legacyBroker.fetch(request, env, ctx)

    const isPatchRoute = request.method === "POST" && url.pathname === "/repo/apply-patch"
    const isDiffRoute = request.method === "GET" && /^\/repo\/diff\/[A-Za-z0-9_-]+$/.test(url.pathname)

    if (isPatchRoute || isDiffRoute) {
      if (!authorized(request, env)) return json({ ok: false, error: "Unauthorized" }, 401)
      return isPatchRoute
        ? handleRepoApplyPatch(request, env)
        : handleRepoDiff(request, env)
    }

    const response = await legacyBroker.fetch(request, env, ctx)
    return url.pathname === "/health" ? withBrokerDiagnostics(response) : response
  },
}
