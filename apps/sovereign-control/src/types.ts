// ── Roles ────────────────────────────────────────────────────────────────────
export type Role = "viewer" | "operator" | "deployer" | "admin"

export const ROLE_LEVELS: Record<Role, number> = {
  viewer: 1,
  operator: 2,
  deployer: 3,
  admin: 4,
}

// ── Action types ──────────────────────────────────────────────────────────────
export type ActionType = "inspect" | "modify" | "deploy" | "rollback"
export type RiskLevel = "low" | "medium" | "high" | "critical"
export type ActionStatus = "ok" | "blocked" | "not_enabled" | "error" | "requires_confirm"

export interface ActionRequest {
  type: ActionType
  tool: string
  target?: string
  payload?: Record<string, unknown>
  confirm?: boolean
}

export interface ActionResponse {
  success: boolean
  status: ActionStatus
  message: string
  risk: RiskLevel
  requiresConfirm: boolean
  logId?: string
  result?: unknown
}

// ── Audit ─────────────────────────────────────────────────────────────────────
export interface AuditEntry {
  id: string
  timestamp: string
  role: Role
  identity: string
  action: ActionType
  tool: string
  target?: string
  status: ActionStatus
  risk: RiskLevel
  ip?: string
}

// ── Env ───────────────────────────────────────────────────────────────────────
export interface Env {
  AI: Ai
  ENVIRONMENT?: string
  GATEWAY_ID?: string
  // Cloudflare Access JWT verification
  TEAM_DOMAIN?: string
  POLICY_AUD?: string
  // GitHub API (read-only token for inspect tools)
  GITHUB_READ_TOKEN?: string
  // Cloudflare API (bound secret — never from request body)
  CF_API_TOKEN?: string
  CF_ACCOUNT_ID?: string
}
