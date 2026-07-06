-- Migration: 0025_referral_affiliate
-- Add referral_code and affiliate_code columns to users table
-- Used by referral tracking and affiliate partner system

ALTER TABLE users ADD COLUMN referral_code TEXT;
ALTER TABLE users ADD COLUMN affiliate_code TEXT;

-- Index for fast lookup by referral/affiliate code
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_affiliate_code ON users(affiliate_code);