-- Migration: 0023_email_notifications
-- Add email notification preferences to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_notifications INTEGER NOT NULL DEFAULT 1;
-- 1 = subscribed to all emails, 0 = unsubscribed from marketing/nurture (transactional still sent)
