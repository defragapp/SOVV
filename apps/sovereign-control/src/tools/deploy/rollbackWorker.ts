/**
 * rollbackWorker.ts
 * Rolls back a Cloudflare Worker to a previous version via the Workers API.
 * Requires CF_API_TOKEN and CF_ACCOUNT_ID in env.
 */

import type { Env } from "../../types.js"

export interface RollbackWorkerResult {
  success: boolean
  workerName: string
  rolledBackTo?: string
  error?: string
}

export async function rollbackWorker(
  env: Env,
  payload: { workerName: string; versionId?: string }
): Promise<RollbackWorkerResult> {
  const { workerName, versionId } = payload

  if (!workerName) {
    return { success: false, workerName: "", error: "workerName is required" }
  }

  if (!env.CF_API_TOKEN || !env.CF_ACCOUNT_ID) {
    return { success: false, workerName, error: "CF_API_TOKEN and CF_ACCOUNT_ID are required" }
  }

  try {
    // List versions to find the target
    const versionsResp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${workerName}/versions`,
      {
        headers: { "Authorization": `Bearer ${env.CF_API_TOKEN}` },
      }
    )

    const versions = await versionsResp.json() as {
      success: boolean
      result?: Array<{ id: string; metadata?: { created_on?: string } }>
    }

    if (!versions.success || !versions.result?.length) {
      return { success: false, workerName, error: "No versions found for worker" }
    }

    // Use specified versionId or the second-most-recent (previous)
    const targetVersion = versionId
      ? versions.result.find(v => v.id === versionId)
      : versions.result[1] // index 0 is current, 1 is previous

    if (!targetVersion) {
      return { success: false, workerName, error: `Version ${versionId ?? "previous"} not found` }
    }

    // Deploy the target version
    const rollbackResp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/workers/scripts/${workerName}/versions/${targetVersion.id}/rollback`,
      {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.CF_API_TOKEN}` },
      }
    )

    const rollbackResult = await rollbackResp.json() as { success: boolean; errors?: Array<{ message: string }> }

    if (!rollbackResult.success) {
      const errMsg = rollbackResult.errors?.map(e => e.message).join(", ") ?? "Rollback failed"
      return { success: false, workerName, error: errMsg }
    }

    return { success: true, workerName, rolledBackTo: targetVersion.id }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, workerName, error: message }
  }
}
