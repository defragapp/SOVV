import type { Role } from "../types.js"
import { ROLE_LEVELS } from "../types.js"

export function hasRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole]
}

export function requireRole(userRole: Role, requiredRole: Role): void {
  if (!hasRole(userRole, requiredRole)) {
    throw new Error(`Role ${requiredRole} required, got ${userRole}`)
  }
}
