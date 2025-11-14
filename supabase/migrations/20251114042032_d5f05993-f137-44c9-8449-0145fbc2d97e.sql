-- Allow candidates to insert their own assessments
CREATE POLICY "allow_candidate_assessment_insert"
ON assessments
FOR INSERT
WITH CHECK (true);

-- Allow candidates to insert their own responses
CREATE POLICY "allow_candidate_response_insert"
ON assessment_responses
FOR INSERT
WITH CHECK (true);