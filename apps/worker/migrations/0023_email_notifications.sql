-- Migration: 0023_email_notifications
-- Add email notification preferences to users table
ALTER TABLE users ADD COLUMN email_notifications INTEGER NOT NULL DEFAULT 1;
