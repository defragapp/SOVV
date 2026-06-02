-- Migration 002: Add subscription state fields to users table
-- Run via: wrangler d1 execute <DB_NAME> --file=migrations/002_subscription_status.sql

ALTER TABLE users ADD COLUMN subscription_status TEXT NOT NULL DEFAULT 'free';
ALTER TABLE users ADD COLUMN stripe_subscription_id TEXT;