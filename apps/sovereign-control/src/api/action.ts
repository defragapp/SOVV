import type { Env, ActionRequest, ActionResponse, Role } from "../types.js"
import { classifyRisk } from "../guard/classifyRisk.js"
import { requiresConfirm } from "../guard/requireConfirm.js"
import { hasRole } from "../auth/requireRole.js"
import { logAudit } from "../audit/logger.js"
import { inspectRepo } from "../tools/inspect/inspectRepo.js"
import { inspectLiveUrl } from "../tools/inspect/inspectLiveUrl.js"
import { deployWorker } from "../tools/deploy/deployWorker.js"
import { rollbackWorker } from "../tools/deploy/rollbackWorker.js"
import { captureScreenshot } from "../tools/browser/browserSession.js"

const ROLE_REQUIREMENTS: Record<string, Role> = {
  inspect_repo: "viewer",
  inspect_live_url: "viewer",
  inspect_routes: "viewer",
  inspect_bindings: "viewer",
  update_file: "operator",
  create_file: "operator",
  patch_file: "operator",
  deploy_worker: "deployer",
  deploy_web: "deployer",
  rollback_worker: "deployer",
  capture_screenshot: "operator",
}

export async function handleAction(
  request: Request,
  env: Env,
  identity: { email: string; role: Role },
  ip: string
): Promise<ActionResponse> {
  let body: ActionRequest
  try {
    body = await request.json() as ActionRequest
  } catch {
    return { success: false, status: "error", message: "Invalid JSON body", risk: "low", requiresConfirm: false }
  }

  const { type, tool, target, payload, confirm } = body
  const risk = classifyRisk(type, tool)
  const needsConfirm = requiresConfirm(risk)

  // Role check
  const requiredRole = ROLE_REQUIREMENTS[tool] || "admin"
  if (!hasRole(identity.role, requiredRole)) {
    logAudit({ role: identity.role, identity: identity.email, action: type, tool, target, status: "blocked", risk, ip })
    return { success: false, status: "blocked", message: `Role ${requiredRole} required`, risk, requiresConfirm: needsConfirm }
  }

  // Confirm check for high-risk actions
  if (needsConfirm && !confirm) {
    return { success: false, status: "requires_confirm", message: `This action (${tool}) requires confirm: true`, risk, requiresConfirm: true }
  }

  // Execute tool
  let result: unknown
  try {
    switch (tool) {
      case "inspect_repo":
        result = await inspectRepo(env, (payload || {}) as { path?: string; ref?: string })
        break
      case "inspect_live_url":
        result = await inspectLiveUrl((payload || {}) as { url: string })
        break
      case "deploy_worker":
        result = await deployWorker(env, (payload || {}) as { workerName: string; scriptContent?: string })
        break
      case "rollback_worker":
        result = await rollbackWorker(env, (payload || {}) as { workerName: string; versionId?: string })
        break
      case "capture_screenshot":
        result = await captureScreenshot((payload || {}) as { url: string })
        break
      default:
        result = { status: "not_enabled", message: `Tool ${tool} not yet implemented` }
    }
  } catch (err) {
    logAudit({ role: identity.role, identity: identity.email, action: type, tool, target, status: "error", risk, ip })
    return { success: false, status: "error", message: String(err), risk, requiresConfirm: false }
  }

  const logEntry = logAudit({ role: identity.role, identity: identity.email, action: type, tool, target, status: "ok", risk, ip })
  return { success: true, status: "ok", message: `${tool} completed`, risk, requiresConfirm: false, logId: logEntry.id, result }
}
