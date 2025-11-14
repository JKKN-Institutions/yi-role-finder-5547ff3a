-- Drop existing INSERT policies on assessments
DROP POLICY IF EXISTS "public_can_insert_assessments" ON public.assessments;
DROP POLICY IF EXISTS "allow_candidate_response_insert" ON public.assessments;
DROP POLICY IF EXISTS "Anyone can create assessments" ON public.assessments;

-- Recreate as explicitly PERMISSIVE policy for public inserts
CREATE POLICY "public_can_insert_assessments" 
ON public.assessments
AS PERMISSIVE
FOR INSERT 
TO public
WITH CHECK (true);

-- Also ensure admin policies are PERMISSIVE
DROP POLICY IF EXISTS "admins_can_select_assessments" ON public.assessments;
DROP POLICY IF EXISTS "admins_can_update_assessments" ON public.assessments;

CREATE POLICY "admins_can_select_assessments" 
ON public.assessments
AS PERMISSIVE
FOR SELECT 
TO authenticated
USING (is_admin_user(auth.uid()));

CREATE POLICY "admins_can_update_assessments" 
ON public.assessments
AS PERMISSIVE
FOR UPDATE 
TO authenticated
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));