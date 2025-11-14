-- Add user_id column to assessments table
ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop all existing policies on assessments
DROP POLICY IF EXISTS "public_can_insert_assessments" ON public.assessments;
DROP POLICY IF EXISTS "admins_can_select_assessments" ON public.assessments;
DROP POLICY IF EXISTS "admins_can_update_assessments" ON public.assessments;

-- Create policies for authenticated users to manage their own assessments
CREATE POLICY "Users can insert their own assessments"
ON public.assessments
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments"
ON public.assessments
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Keep admin policies for full access
CREATE POLICY "Admins can view all assessments"
ON public.assessments
FOR SELECT
TO authenticated
USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update all assessments"
ON public.assessments
FOR UPDATE
TO authenticated
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));