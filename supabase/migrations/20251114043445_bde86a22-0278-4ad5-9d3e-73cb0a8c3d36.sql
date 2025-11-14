-- Drop existing INSERT policies on assessments
DROP POLICY IF EXISTS "Anyone can create assessments" ON public.assessments;
DROP POLICY IF EXISTS "allow_candidate_assessment_insert" ON public.assessments;

-- Create a new PERMISSIVE policy that allows anyone to insert assessments
CREATE POLICY "Anyone can create assessments"
ON public.assessments
FOR INSERT
TO public
WITH CHECK (true);