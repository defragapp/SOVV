-- Migration: 0022_invites_v2
-- Create invites_v2 table for the Invite Privately feature
-- This table was created directly in production on 2026-07-05

CREATE TABLE IF NOT EXISTS invites_v2 (
  token TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  invitee_id TEXT,
  library_id TEXT,
  workspace_source TEXT,
  invite_mode TEXT DEFAULT 'reflection',
  status TEXT NOT NULL DEFAULT 'pending',
  comparison_result TEXT,
  created_at TEXT NOT NULL,
  expires_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_invites_v2_token ON invites_v2(token);
CREATE INDEX IF NOT EXISTS idx_invites_v2_owner ON invites_v2(owner_id);
