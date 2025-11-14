-- Add full_name column to assessments table
ALTER TABLE assessments
ADD COLUMN user_name TEXT;