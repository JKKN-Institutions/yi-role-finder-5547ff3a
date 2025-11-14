-- STEP 1 & 2: RLS will be re-enabled after policy creation

-- STEP 3: Delete ALL existing policies on assessments table
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can create assessment" ON public.assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can update all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can update in progress assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can view their assessment by email" ON public.assessments;
DROP POLICY IF EXISTS "allow_all_inserts" ON public.assessments;
DROP POLICY IF EXISTS "public_can_insert_assessments" ON public.assessments;

-- STEP 4: CREATE ONE SIMPLE POLICY - Allow all INSERT operations
CREATE POLICY "allow_all_inserts"
ON public.assessments
FOR INSERT
WITH CHECK (true);

-- Allow admins to view all assessments
CREATE POLICY "admins_view_all"
ON public.assessments
FOR SELECT
TO authenticated
USING (is_admin_user(auth.uid()));

-- Allow admins to update all assessments
CREATE POLICY "admins_update_all"
ON public.assessments
FOR UPDATE
TO authenticated
USING (is_admin_user(auth.uid()));

-- Allow anyone to update in-progress assessments (for saving responses)
CREATE POLICY "update_in_progress"
ON public.assessments
FOR UPDATE
WITH CHECK (status = 'in_progress'::assessment_status);

-- STEP 7: Ensure user_id is nullable
ALTER TABLE public.assessments ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.assessments ALTER COLUMN user_id SET DEFAULT NULL;