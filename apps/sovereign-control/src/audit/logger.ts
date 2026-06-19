import type { AuditEntry, ActionType, ActionStatus, RiskLevel, Role } from "../types.js"

/**
 * Log an audit entry.
 * In production, write to D1 or Analytics Engine.
 * For now, structured console.log (captured by Workers Observability).
 */
export function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const full: AuditEntry = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ...entry,
  }
  // Structured log — captured by Workers Observability
  console.log(JSON.stringify({ audit: true, ...full }))
  return full
}

export function buildAuditEntry(params: {
  role: Role
  identity: string
  action: ActionType
  tool: string
  target?: string
  status: ActionStatus
  risk: RiskLevel
  ip?: string
}): Omit<AuditEntry, "id" | "timestamp"> {
  return params
}
