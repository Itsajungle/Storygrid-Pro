-- ============================================
-- Update ai_recommendations table to support new status values
-- ============================================
-- Run this in Supabase SQL Editor after the main setup

-- Drop the existing check constraint
ALTER TABLE ai_recommendations DROP CONSTRAINT IF EXISTS ai_recommendations_status_check;

-- Add new check constraint with additional status values
ALTER TABLE ai_recommendations ADD CONSTRAINT ai_recommendations_status_check 
CHECK (status IN ('active', 'pending', 'applied', 'resolved', 'dismissed', 'expired'));

-- Update default status to 'pending' instead of 'active'
ALTER TABLE ai_recommendations ALTER COLUMN status SET DEFAULT 'pending';

-- Add updated_at column for tracking changes
ALTER TABLE ai_recommendations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for pending recommendations (most common query)
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_pending 
ON ai_recommendations(priority, created_at DESC) 
WHERE status IN ('pending', 'active');

-- Comment
COMMENT ON COLUMN ai_recommendations.status IS 'Recommendation status: pending (new), active (acknowledged), applied (implemented), resolved (completed), dismissed (rejected), expired (outdated)';

-- Success message
SELECT 'ai_recommendations table updated successfully with new status values' AS result;

