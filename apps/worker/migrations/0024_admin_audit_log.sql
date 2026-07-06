-- Migration: 0024_admin_audit_log
-- Admin audit log for security-sensitive operations
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id TEXT PRIMARY KEY,
  actor_id TEXT NOT NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  target_id TEXT,
  target_email TEXT,
  metadata TEXT,
  ip TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON admin_audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON admin_audit_log(created_at);
