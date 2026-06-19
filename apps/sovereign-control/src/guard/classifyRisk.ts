import type { ActionType, RiskLevel } from "../types.js"

const HIGH_RISK_TOOLS = new Set([
  "deploy_worker", "deploy_web", "rollback_worker",
  "delete_file", "delete_worker",
])

const MEDIUM_RISK_TOOLS = new Set([
  "update_file", "patch_file", "create_file",
])

export function classifyRisk(action: ActionType, tool: string): RiskLevel {
  if (action === "deploy" || action === "rollback") return "high"
  if (HIGH_RISK_TOOLS.has(tool)) return "high"
  if (MEDIUM_RISK_TOOLS.has(tool)) return "medium"
  if (action === "inspect") return "low"
  return "medium"
}
