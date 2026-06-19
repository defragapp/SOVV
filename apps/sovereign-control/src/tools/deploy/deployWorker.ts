import type { Env } from "../../types.js"

/**
 * Deploy a Worker via Cloudflare API.
 * Uses bound CF_API_TOKEN secret — never accepts token from caller.
 */
export async function deployWorker(
  env: Env,
  params: { workerName: string; scriptContent?: string; triggerGitHub?: boolean }
): Promise<unknown> {
  const token = env.CF_API_TOKEN
  const accountId = env.CF_ACCOUNT_ID

  if (!token || !accountId) {
    return {
      status: "not_enabled",
      message: "CF_API_TOKEN and CF_ACCOUNT_ID must be configured as Worker secrets",
    }
  }

  if (params.triggerGitHub) {
    // Preferred: trigger GitHub Actions deploy workflow
    // This is safer than direct API deploy as it goes through CI
    return {
      status: "not_enabled",
      message: "GitHub Actions deploy trigger not yet wired. Configure GITHUB_DEPLOY_TOKEN.",
    }
  }

  // Direct deploy via CF API (use with caution — bypasses CI)
  if (!params.scriptContent) {
    return { status: "error", message: "scriptContent required for direct deploy" }
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${params.workerName}`
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/javascript",
    },
    body: params.scriptContent,
  })

  const data = await res.json()
  return { status: res.ok ? "ok" : "error", cloudflare: data }
}
