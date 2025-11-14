-- Fix RLS policies for anonymous assessment submissions
DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessments;
CREATE POLICY "anon_and_auth_can_insert" ON public.assessments FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_in_progress" ON public.assessments;
CREATE POLICY "update_in_progress" ON public.assessments FOR UPDATE TO anon, authenticated USING (status = 'in_progress'::assessment_status) WITH CHECK (status = 'in_progress'::assessment_status);

DROP POLICY IF EXISTS "Anyone can insert responses" ON public.assessment_responses;
CREATE POLICY "anon_and_auth_can_insert_responses" ON public.assessment_responses FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_and_auth_can_update_responses" ON public.assessment_responses;
CREATE POLICY "anon_and_auth_can_update_responses" ON public.assessment_responses FOR UPDATE TO anon, authenticated WITH CHECK (true);