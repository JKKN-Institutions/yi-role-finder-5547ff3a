-- Make user_id nullable for anonymous submissions
ALTER TABLE public.assessments 
ALTER COLUMN user_id DROP NOT NULL;

-- Add session_id for tracking anonymous users
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS session_id text;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can insert their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can view their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Users can update their own assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON public.assessments;
DROP POLICY IF EXISTS "Admins can update all assessments" ON public.assessments;

-- NEW: Allow ANYONE (anonymous or authenticated) to INSERT assessments
CREATE POLICY "Anyone can create assessment"
ON public.assessments
AS PERMISSIVE
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- NEW: Admins can view all assessments
CREATE POLICY "Admins can view all assessments"
ON public.assessments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin_user(auth.uid()));

-- NEW: Admins can update all assessments
CREATE POLICY "Admins can update all assessments"
ON public.assessments
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));

-- Allow anyone to update their own in-progress assessment (for saving progress)
CREATE POLICY "Anyone can update in progress assessments"
ON public.assessments
AS PERMISSIVE
FOR UPDATE
TO anon, authenticated
WITH CHECK (status = 'in_progress');