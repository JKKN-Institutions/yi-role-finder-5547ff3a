-- First, let's see what policies exist
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT policyname FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'assessments'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.assessments', r.policyname);
  END LOOP;
END $$;

-- Now create a single, explicitly PERMISSIVE INSERT policy for public users
CREATE POLICY "public_can_insert_assessments"
ON public.assessments
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- Recreate the admin policies
CREATE POLICY "admins_can_select_assessments"
ON public.assessments
AS PERMISSIVE
FOR SELECT
TO public
USING (is_admin_user(auth.uid()));

CREATE POLICY "admins_can_update_assessments"
ON public.assessments
AS PERMISSIVE
FOR UPDATE
TO public
USING (is_admin_user(auth.uid()))
WITH CHECK (is_admin_user(auth.uid()));