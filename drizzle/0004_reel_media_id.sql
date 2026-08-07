-- Migration: Add reel_media_id column for per-reel webhook matching
-- Each campaign can now be tied to a specific Instagram media (reel/post) by its numeric ID

ALTER TABLE automation_campaigns
  ADD COLUMN IF NOT EXISTS reel_media_id TEXT;

-- Index for fast lookup when webhook fires
CREATE INDEX IF NOT EXISTS idx_campaigns_reel_media_id
  ON automation_campaigns(reel_media_id)
  WHERE reel_media_id IS NOT NULL AND is_active = TRUE;
