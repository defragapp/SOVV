import type { RiskLevel } from "../types.js"

/**
 * Determine if an action requires explicit confirmation.
 * High-risk actions always require confirm: true in the request.
 */
export function requiresConfirm(risk: RiskLevel): boolean {
  return risk === "high" || risk === "critical"
}
