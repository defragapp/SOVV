-- Migration: 0017_sessions_cleanup_index
-- Add index on sessions.expires_at for efficient cleanup queries.
-- Expired sessions accumulate without cleanup; this index enables
-- efficient DELETE WHERE expires_at < ? queries.
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
