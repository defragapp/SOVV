-- Migration: 0020_users_email_verified
-- Add email_verified column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified INTEGER NOT NULL DEFAULT 0;
