-- Update assessment_results table to include quadrant and detailed recommendations
ALTER TABLE assessment_results 
ADD COLUMN IF NOT EXISTS quadrant TEXT,
ADD COLUMN IF NOT EXISTS recommendations JSONB,
ADD COLUMN IF NOT EXISTS reasoning TEXT;

-- Update to add comment for clarity
COMMENT ON COLUMN assessment_results.quadrant IS 'Q1=STAR, Q2=WILLING, Q3=NOT READY, Q4=RELUCTANT';
COMMENT ON COLUMN assessment_results.recommendations IS 'Array of top 3 role recommendations with confidence percentages';
COMMENT ON COLUMN assessment_results.reasoning IS 'AI-generated personalized explanation for scores and recommendations';