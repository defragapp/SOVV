-- Migration: 0016_sessions_expires_at
-- Ensure sessions table uses expires_at column name consistently.
-- The baseline schema defined expires_at but some code used expires.
-- This migration adds expires_at if missing, or is a no-op if already correct.
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS expires_at INTEGER;
-- Backfill from expires if that column exists
UPDATE sessions SET expires_at = expires WHERE expires_at IS NULL AND expires IS NOT NULL;
