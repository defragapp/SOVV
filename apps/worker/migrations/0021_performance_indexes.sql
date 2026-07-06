-- Migration: 0021_performance_indexes
-- Add performance indexes for frequently queried tables
-- These indexes significantly reduce query time for user-scoped data fetches

-- Library: user_id is the primary filter for all library queries
CREATE INDEX IF NOT EXISTS idx_library_user_id ON library(user_id);
CREATE INDEX IF NOT EXISTS idx_library_user_source ON library(user_id, workspace_source);
CREATE INDEX IF NOT EXISTS idx_library_user_created ON library(user_id, created_at DESC);

-- Interactions: session_id is used for history queries
CREATE INDEX IF NOT EXISTS idx_interactions_session ON interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON interactions(session_id, created_at DESC);

-- Patterns: session_id is used for pattern extraction
CREATE INDEX IF NOT EXISTS idx_patterns_session ON patterns(session_id);

-- People: user_id is the primary filter
CREATE INDEX IF NOT EXISTS idx_people_user_id ON people(user_id);

-- Sessions: user_id for session listing, expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Stripe events: id for idempotency checks
CREATE INDEX IF NOT EXISTS idx_stripe_events_id ON stripe_events(id);
