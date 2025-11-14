-- Grant INSERT permissions to anon role for assessments
GRANT INSERT ON public.assessments TO anon;
GRANT INSERT ON public.assessment_responses TO anon;

-- Also grant SELECT on assessments for the anon role to check status
GRANT SELECT ON public.assessments TO anon;
GRANT SELECT ON public.assessment_responses TO anon;

-- Grant UPDATE on assessments for anonymous users to update progress
GRANT UPDATE ON public.assessments TO anon;
GRANT UPDATE ON public.assessment_responses TO anon;