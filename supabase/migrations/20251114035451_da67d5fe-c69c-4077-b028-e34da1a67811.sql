-- Add database constraints for email format validation and field length limits
DO $$ 
BEGIN
  -- Add email format constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_email_format'
  ) THEN
    ALTER TABLE assessments ADD CONSTRAINT valid_email_format 
    CHECK (user_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;

  -- Add name length constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_name_length'
  ) THEN
    ALTER TABLE assessments ADD CONSTRAINT user_name_length 
    CHECK (length(user_name) > 0 AND length(user_name) <= 100);
  END IF;

  -- Add email length constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_email_length'
  ) THEN
    ALTER TABLE assessments ADD CONSTRAINT user_email_length 
    CHECK (length(user_email) <= 255);
  END IF;
END $$;

-- Fix RLS policies on assessments table - drop all existing public access policies
DROP POLICY IF EXISTS "Anyone can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Anyone can update their own assessments" ON assessments;
DROP POLICY IF EXISTS "Admins can view all assessments" ON assessments;
DROP POLICY IF EXISTS "Admins can update all assessments" ON assessments;

-- Create admin-only policies for assessments
CREATE POLICY "Admins can view all assessments" ON assessments
FOR SELECT USING (is_admin_user(auth.uid()));

CREATE POLICY "Admins can update all assessments" ON assessments
FOR UPDATE USING (is_admin_user(auth.uid()));

-- Fix RLS policies on assessment_responses table
DROP POLICY IF EXISTS "Anyone can view responses" ON assessment_responses;
DROP POLICY IF EXISTS "Anyone can update responses" ON assessment_responses;
DROP POLICY IF EXISTS "Admins can view all responses" ON assessment_responses;

CREATE POLICY "Admins can view all responses" ON assessment_responses
FOR SELECT USING (is_admin_user(auth.uid()));

-- Fix assessment_results policies
DROP POLICY IF EXISTS "Anyone can view results" ON assessment_results;
DROP POLICY IF EXISTS "Admins can view all results" ON assessment_results;

CREATE POLICY "Admins can view all results" ON assessment_results
FOR SELECT USING (is_admin_user(auth.uid()));