-- Fix RLS policies to properly allow anonymous users to insert assessments
-- The issue: previous policies didn't explicitly target the 'anon' role
-- When no role is specified, RLS policies default to authenticated users only

-- Drop the existing insert policy that's not working for anonymous users
DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessments;

-- Create a new policy that explicitly allows both anonymous and authenticated users to insert
CREATE POLICY "anon_and_auth_can_insert"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Also ensure the update policy allows anonymous users to update in-progress assessments
DROP POLICY IF EXISTS "update_in_progress" ON public.assessments;

CREATE POLICY "update_in_progress"
ON public.assessments
FOR UPDATE
TO anon, authenticated
USING (status = 'in_progress'::assessment_status)
WITH CHECK (status = 'in_progress'::assessment_status);

-- Similarly fix assessment_responses policies for anonymous users
DROP POLICY IF EXISTS "Anyone can insert responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Anyone can update responses" ON public.assessment_responses;

CREATE POLICY "anon_and_auth_can_insert_responses"
ON public.assessment_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "anon_and_auth_can_update_responses"
ON public.assessment_responses
FOR UPDATE
TO anon, authenticated
WITH CHECK (true);
