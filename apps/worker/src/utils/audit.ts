/**
 * audit.ts
 * Admin audit log for security-sensitive operations.
 * Logs tier changes, account deletions, admin actions.
 */
import type { D1Database } from "@cloudflare/workers-types";

export type AuditAction =
  | "tier_change"
  | "account_deleted"
  | "password_changed"
  | "admin_login"
  | "promo_code_created"
  | "promo_code_redeemed"
  | "subscription_activated"
  | "checkout_completed"
  | "subscription_canceled"
  | "email_verified"
  | "session_revoked_all";

export async function writeAuditLog(
  DB: D1Database,
  opts: {
    actorId: string;
    actorEmail?: string;
    action: AuditAction;
    targetId?: string;
    targetEmail?: string;
    metadata?: Record<string, unknown>;
    ip?: string;
  }
): Promise<void> {
  try {
    await DB.prepare(
      "INSERT INTO admin_audit_log (id, actor_id, actor_email, action, target_id, target_email, metadata, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    ).bind(
      crypto.randomUUID(),
      opts.actorId,
      opts.actorEmail ?? null,
      opts.action,
      opts.targetId ?? null,
      opts.targetEmail ?? null,
      opts.metadata ? JSON.stringify(opts.metadata) : null,
      opts.ip ?? null,
      Date.now()
    ).run();
  } catch {
    // Audit log failures must never break the main flow
  }
}
