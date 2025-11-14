-- Create enum for assessment status
CREATE TYPE assessment_status AS ENUM ('in_progress', 'completed', 'analyzed');

-- Create assessments table to track user progress
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL,
  status assessment_status DEFAULT 'in_progress',
  current_question INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create assessment_responses table to store individual answers
CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_text TEXT NOT NULL,
  response_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assessment_id, question_number)
);

-- Create assessment_results table for AI analysis
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE UNIQUE,
  will_score INTEGER CHECK (will_score >= 0 AND will_score <= 100),
  skill_score INTEGER CHECK (skill_score >= 0 AND skill_score <= 100),
  recommended_role TEXT NOT NULL,
  role_explanation TEXT,
  vertical_matches TEXT[],
  leadership_style TEXT,
  key_insights JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (no auth required for now)
CREATE POLICY "Anyone can create assessments"
  ON assessments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own assessments"
  ON assessments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their own assessments"
  ON assessments FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create responses"
  ON assessment_responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view responses"
  ON assessment_responses FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update responses"
  ON assessment_responses FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can view results"
  ON assessment_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create results"
  ON assessment_results FOR INSERT
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_assessments_user_email ON assessments(user_email);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_responses_assessment_id ON assessment_responses(assessment_id);
CREATE INDEX idx_results_assessment_id ON assessment_results(assessment_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();