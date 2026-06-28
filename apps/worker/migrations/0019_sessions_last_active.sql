-- Migration: 0019_sessions_last_active
-- Add last_active column to sessions table.
-- Tracks when a session was last used for security auditing.
ALTER TABLE sessions ADD COLUMN last_active INTEGER;
-- Backfill with created_at for existing sessions
UPDATE sessions SET last_active = created_at WHERE last_active IS NULL;
