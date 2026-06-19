import type { Env } from "../../types.js"

export async function rollbackWorker(
  env: Env,
  params: { workerName: string; versionId?: string }
): Promise<unknown> {
  const token = env.CF_API_TOKEN
  const accountId = env.CF_ACCOUNT_ID

  if (!token || !accountId) {
    return {
      status: "not_enabled",
      message: "CF_API_TOKEN and CF_ACCOUNT_ID must be configured as Worker secrets",
    }
  }

  // List versions first if no versionId provided
  if (!params.versionId) {
    const versionsUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${params.workerName}/versions`
    const versionsRes = await fetch(versionsUrl, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const versions = await versionsRes.json()
    return {
      status: "requires_confirm",
      message: "Specify a versionId to rollback to",
      versions,
    }
  }

  // Rollback to specific version
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${params.workerName}/deployments`
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ strategy: "percentage", versions: [{ version_id: params.versionId, percentage: 100 }] }),
  })

  const data = await res.json()
  return { status: res.ok ? "ok" : "error", cloudflare: data }
}
