-- Add hire tracking fields to candidate_feedback table for validation loop
ALTER TABLE candidate_feedback 
ADD COLUMN IF NOT EXISTS actual_hire_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_vertical_assigned text,
ADD COLUMN IF NOT EXISTS hire_confidence_match boolean,
ADD COLUMN IF NOT EXISTS performance_notes text;

-- Add vertical filtering support to assessments results
ALTER TABLE assessment_results
ADD COLUMN IF NOT EXISTS vertical_priority_order jsonb;

COMMENT ON COLUMN candidate_feedback.actual_hire_date IS 'Date when candidate was actually hired/assigned';
COMMENT ON COLUMN candidate_feedback.actual_vertical_assigned IS 'Actual vertical the candidate was assigned to';
COMMENT ON COLUMN candidate_feedback.hire_confidence_match IS 'Whether the hire matched AI confidence prediction';
COMMENT ON COLUMN candidate_feedback.performance_notes IS 'Ongoing performance tracking notes';
COMMENT ON COLUMN assessment_results.vertical_priority_order IS 'Ordered list of vertical preferences with metadata';