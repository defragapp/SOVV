-- Migration: 0015_sessions_token_index
-- Add unique index on sessions.token for O(1) auth lookups
-- Every authenticated request queries sessions WHERE token = ?
-- Without this index, every auth check is a full table scan
CREATE UNIQUE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
