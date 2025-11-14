-- Fix INSERT policy on assessments table
DROP POLICY IF EXISTS "allow_user_to_create" ON public.assessments;
DROP POLICY IF EXISTS "anon_and_auth_can_insert" ON public.assessments;

CREATE POLICY "anon_and_auth_can_insert"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);