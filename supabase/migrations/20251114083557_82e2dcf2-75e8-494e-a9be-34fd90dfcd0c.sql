
-- Comprehensive fix for anonymous assessment submission RLS policies

-- ============================================
-- STEP 1: Clean up assessments table policies
-- ============================================
DROP POLICY IF EXISTS "admins_view_all" ON public.assessments;
DROP POLICY IF EXISTS "admins_update_all" ON public.assessments;
DROP POLICY IF EXISTS "anon_and_auth_can_insert" ON public.assessments;
DROP POLICY IF EXISTS "enable_insert_for_anon_and_auth" ON public.assessments;
DROP POLICY IF EXISTS "update_in_progress" ON public.assessments;
DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessments;

-- ============================================
-- STEP 2: Clean up assessment_responses table policies
-- ============================================
DROP POLICY IF EXISTS "Admins can view all responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "Anyone can create responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "anon_and_auth_can_insert_responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "anon_and_auth_can_update_responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "enable_insert_responses_for_anon_and_auth" ON public.assessment_responses;

-- ============================================
-- STEP 3: Grant necessary permissions to anon role
-- ============================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT, UPDATE ON public.assessments TO anon;
GRANT INSERT, SELECT, UPDATE ON public.assessment_responses TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ============================================
-- STEP 4: Create clean policies for assessments
-- ============================================

-- Allow anonymous and authenticated users to insert assessments
CREATE POLICY "allow_anon_insert_assessments"
ON public.assessments
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous and authenticated users to update in-progress assessments
CREATE POLICY "allow_anon_update_in_progress"
ON public.assessments
FOR UPDATE
TO anon, authenticated
USING (status = 'in_progress'::assessment_status)
WITH CHECK (status = 'in_progress'::assessment_status);

-- Allow admins to view all assessments
CREATE POLICY "allow_admin_view_all"
ON public.assessments
FOR SELECT
TO authenticated
USING (is_admin_user(auth.uid()));

-- Allow admins to update all assessments
CREATE POLICY "allow_admin_update_all"
ON public.assessments
FOR UPDATE
TO authenticated
USING (is_admin_user(auth.uid()));

-- ============================================
-- STEP 5: Create clean policies for assessment_responses
-- ============================================

-- Allow anonymous and authenticated users to insert responses
CREATE POLICY "allow_anon_insert_responses"
ON public.assessment_responses
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow anonymous and authenticated users to update responses
CREATE POLICY "allow_anon_update_responses"
ON public.assessment_responses
FOR UPDATE
TO anon, authenticated
WITH CHECK (true);

-- Allow admins to view all responses
CREATE POLICY "allow_admin_view_responses"
ON public.assessment_responses
FOR SELECT
TO authenticated
USING (is_admin_user(auth.uid()));

-- ============================================
-- STEP 6: Ensure RLS is enabled
-- ============================================
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;
