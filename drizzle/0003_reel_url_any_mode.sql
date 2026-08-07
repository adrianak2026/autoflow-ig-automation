-- Migration: Add 'any' match mode + reel_url column to automation_campaigns
-- Run: npx drizzle-kit migrate

-- 1. Add 'any' value to existing match_mode enum
ALTER TYPE match_mode ADD VALUE IF NOT EXISTS 'any';

-- 2. Add reel_url column to automation_campaigns (nullable)
ALTER TABLE automation_campaigns ADD COLUMN IF NOT EXISTS reel_url TEXT;
