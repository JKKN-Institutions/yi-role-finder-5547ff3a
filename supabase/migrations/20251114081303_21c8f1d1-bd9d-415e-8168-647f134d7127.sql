-- Fix INSERT policy for assessments (remove USING clause)
DROP POLICY IF EXISTS "anon_and_auth_can_insert" ON public.assessments;

CREATE POLICY "anon_and_auth_can_insert" 
ON public.assessments
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Fix INSERT policy for assessment_responses (remove USING clause)
DROP POLICY IF EXISTS "anon_and_auth_can_insert_responses" ON public.assessment_responses;

CREATE POLICY "anon_and_auth_can_insert_responses" 
ON public.assessment_responses
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);