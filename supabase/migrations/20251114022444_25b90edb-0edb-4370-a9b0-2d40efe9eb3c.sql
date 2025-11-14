-- Add scoring_breakdown field to store detailed scoring information
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS scoring_breakdown jsonb;

-- Add comment for clarity
COMMENT ON COLUMN assessment_results.scoring_breakdown IS 'Stores detailed breakdown of WILL and SKILL scores for admin transparency';