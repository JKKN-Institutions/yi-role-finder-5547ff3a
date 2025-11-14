-- First, update any existing NULL user_name values to a default value
UPDATE public.assessments 
SET user_name = 'Unknown User' 
WHERE user_name IS NULL;

-- Now make user_name NOT NULL since it's always required
ALTER TABLE public.assessments 
  ALTER COLUMN user_name SET NOT NULL;

-- Drop old constraint
ALTER TABLE public.assessments 
  DROP CONSTRAINT IF EXISTS user_name_length;

-- Add new constraint that works properly
ALTER TABLE public.assessments 
  ADD CONSTRAINT user_name_length 
  CHECK (length(user_name) BETWEEN 1 AND 100);

-- Remove duplicate policy
DROP POLICY IF EXISTS "allow_candidate_assessment_insert" ON public.assessments;