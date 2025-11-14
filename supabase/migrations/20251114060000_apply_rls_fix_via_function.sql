-- Create a function that applies the RLS fix
-- This can be called from the application to fix the policies

CREATE OR REPLACE FUNCTION public.fix_anonymous_assessment_rls()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop existing policies
  EXECUTE 'DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessments';
  EXECUTE 'DROP POLICY IF EXISTS "update_in_progress" ON public.assessments';
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can insert responses" ON public.assessment_responses';
  EXECUTE 'DROP POLICY IF EXISTS "Anyone can update responses" ON public.assessment_responses';

  -- Create new policies with proper role targeting
  EXECUTE 'CREATE POLICY "anon_and_auth_can_insert" ON public.assessments FOR INSERT TO anon, authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "update_in_progress" ON public.assessments FOR UPDATE TO anon, authenticated USING (status = ''in_progress''::assessment_status) WITH CHECK (status = ''in_progress''::assessment_status)';
  EXECUTE 'CREATE POLICY "anon_and_auth_can_insert_responses" ON public.assessment_responses FOR INSERT TO anon, authenticated WITH CHECK (true)';
  EXECUTE 'CREATE POLICY "anon_and_auth_can_update_responses" ON public.assessment_responses FOR UPDATE TO anon, authenticated WITH CHECK (true)';

  RETURN 'RLS policies fixed successfully for anonymous assessment submissions';
END;
$$;

-- Execute the function immediately
SELECT public.fix_anonymous_assessment_rls();

-- Drop the function after execution (cleanup)
DROP FUNCTION IF EXISTS public.fix_anonymous_assessment_rls();
