-- Migration: 008_invites_v2
-- Recreates invites table without strict library_id FK constraint
-- Allows invite creation without requiring a library item
CREATE TABLE IF NOT EXISTS invites_v2 (
  token TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  library_id TEXT,
  workspace_source TEXT NOT NULL DEFAULT 'DEFRAG',
  invite_mode TEXT NOT NULL DEFAULT 'reflection',
  status TEXT NOT NULL DEFAULT 'pending',
  invitee_id TEXT,
  comparison_result JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_invites_v2_owner ON invites_v2(owner_id);
CREATE INDEX IF NOT EXISTS idx_invites_v2_invitee ON invites_v2(invitee_id);
