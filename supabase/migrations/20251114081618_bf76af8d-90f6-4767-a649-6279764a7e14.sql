-- Step 1: Grant database-level permissions to anon role
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT, SELECT, UPDATE ON public.assessments TO anon;
GRANT INSERT, SELECT, UPDATE ON public.assessment_responses TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 2: Drop all existing INSERT policies
DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessments;
DROP POLICY IF EXISTS "anon_and_auth_can_insert" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can insert responses" ON public.assessment_responses;
DROP POLICY IF EXISTS "anon_and_auth_can_insert_responses" ON public.assessment_responses;

-- Step 3: Create correct INSERT policies (WITH CHECK only, no USING)
CREATE POLICY "enable_insert_for_anon_and_auth" ON public.assessments
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "enable_insert_responses_for_anon_and_auth" ON public.assessment_responses
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Step 4: Ensure RLS is enabled
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;