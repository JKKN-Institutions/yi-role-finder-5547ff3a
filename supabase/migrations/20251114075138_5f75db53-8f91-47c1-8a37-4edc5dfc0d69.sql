-- Fix anon_and_auth_can_insert_responses policy to use INSERT command
DROP POLICY IF EXISTS "anon_and_auth_can_insert_responses" ON public.assessment_responses;

CREATE POLICY "anon_and_auth_can_insert_responses"
ON public.assessment_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);