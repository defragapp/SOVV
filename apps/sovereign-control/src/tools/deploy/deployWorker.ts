/**
 * deployWorker.ts
 * Deploys a Cloudflare Worker script via the Workers API.
 * Requires CF_API_TOKEN and CF_ACCOUNT_ID in env.
 */

import type { Env } from "../../types.js"

export interface DeployWorkerResult {
  success: boolean
  workerName: string
  deployedAt?: string
  error?: string
}

export async function deployWorker(
  env: Env,
  payload: { workerName: string; scriptContent?: string }
): Promise<DeployWorkerResult> {
  const { workerName, scriptContent } = payload

  if (!workerName) {
    return { success: false, workerName: "", error: "workerName is required" }
  }

  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return { success: false, workerName, error: "CF_API_TOKEN and CF_ACCOUNT_ID are required" }
  }

  if (!scriptContent) {
    return { success: false, workerName, error: "scriptContent is required for deploy" }
  }

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${workerName}`,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${env.CF_API_TOKEN}`,
          "Content-Type": "application/javascript",
        },
        body: scriptContent,
      }
    )

    const result = await response.json() as { success: boolean; errors?: Array<{ message: string }> }

    if (!result.success) {
      const errMsg = result.errors?.map(e => e.message).join(", ") ?? "Unknown error"
      return { success: false, workerName, error: errMsg }
    }

    return { success: true, workerName, deployedAt: new Date().toISOString() }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, workerName, error: message }
  }
}
