-- Migration 002: Add subscription state fields to users table
-- Run via: wrangler d1 execute <DB_NAME> --file=apps/worker/migrations/002_subscription_status.sql
-- SQLite/D1: ALTER TABLE ADD COLUMN is safe and non-destructive

ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN stripe_price_id TEXT;
ALTER TABLE users ADD COLUMN subscription_current_period_end INTEGER;
ALTER TABLE users ADD COLUMN subscription_updated_at INTEGER;