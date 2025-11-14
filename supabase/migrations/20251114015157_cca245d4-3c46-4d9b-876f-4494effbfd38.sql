-- Create feedback table for leadership input
CREATE TABLE public.candidate_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Feedback fields
  ai_accuracy TEXT CHECK (ai_accuracy IN ('accurate', 'partial', 'inaccurate')),
  actual_role_assigned TEXT,
  override_reasoning TEXT,
  recommended_role_was TEXT, -- Store original AI recommendation for comparison
  
  -- Follow-up data
  six_month_performance_rating INTEGER CHECK (six_month_performance_rating >= 1 AND six_month_performance_rating <= 5),
  six_month_notes TEXT,
  is_still_active BOOLEAN,
  
  -- Metadata
  feedback_date TIMESTAMPTZ DEFAULT now(),
  six_month_review_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for querying feedback
CREATE INDEX idx_candidate_feedback_assessment_id ON public.candidate_feedback(assessment_id);
CREATE INDEX idx_candidate_feedback_reviewer_id ON public.candidate_feedback(reviewer_id);
CREATE INDEX idx_candidate_feedback_date ON public.candidate_feedback(feedback_date DESC);

-- Enable RLS
ALTER TABLE public.candidate_feedback ENABLE ROW LEVEL SECURITY;

-- RLS policies for feedback
CREATE POLICY "Admins can view all feedback"
  ON public.candidate_feedback FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can insert feedback"
  ON public.candidate_feedback FOR INSERT
  WITH CHECK (public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can update feedback"
  ON public.candidate_feedback FOR UPDATE
  USING (public.is_admin_user(auth.uid()));

-- Create A/B testing configuration table
CREATE TABLE public.ab_test_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  
  -- Configuration
  question_variants JSONB, -- Store different question variations
  scoring_weights JSONB, -- Store different scoring weight configs
  target_percentage INTEGER DEFAULT 50, -- What % of users get this variant
  
  -- Results tracking
  total_assignments INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(test_name, variant_name)
);

-- Enable RLS on ab_test_config
ALTER TABLE public.ab_test_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage A/B tests"
  ON public.ab_test_config FOR ALL
  USING (public.is_admin_user(auth.uid()));

-- Create validation metrics table for tracking accuracy over time
CREATE TABLE public.validation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Core metrics
  total_assessments INTEGER DEFAULT 0,
  total_with_feedback INTEGER DEFAULT 0,
  accurate_predictions INTEGER DEFAULT 0,
  partial_predictions INTEGER DEFAULT 0,
  inaccurate_predictions INTEGER DEFAULT 0,
  
  -- Calculated percentages
  recommendation_accuracy_percent DECIMAL(5,2),
  override_rate_percent DECIMAL(5,2),
  
  -- Performance metrics
  avg_six_month_rating DECIMAL(3,2),
  retention_rate_percent DECIMAL(5,2),
  
  -- Model version tracking
  model_version TEXT,
  scoring_config JSONB,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(metric_date)
);

-- Enable RLS on validation_metrics
ALTER TABLE public.validation_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view metrics"
  ON public.validation_metrics FOR SELECT
  USING (public.is_admin_user(auth.uid()));

CREATE POLICY "System can insert metrics"
  ON public.validation_metrics FOR INSERT
  WITH CHECK (true);

-- Create trigger for feedback updated_at
CREATE TRIGGER update_candidate_feedback_updated_at
  BEFORE UPDATE ON public.candidate_feedback
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for ab_test_config updated_at
CREATE TRIGGER update_ab_test_config_updated_at
  BEFORE UPDATE ON public.ab_test_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate daily validation metrics
CREATE OR REPLACE FUNCTION public.calculate_validation_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date DATE := CURRENT_DATE - INTERVAL '1 day';
  v_total_assessments INTEGER;
  v_total_feedback INTEGER;
  v_accurate INTEGER;
  v_partial INTEGER;
  v_inaccurate INTEGER;
  v_overrides INTEGER;
  v_avg_rating DECIMAL(3,2);
  v_active_count INTEGER;
  v_total_reviewed INTEGER;
BEGIN
  -- Get counts for the date
  SELECT COUNT(*) INTO v_total_assessments
  FROM assessments
  WHERE DATE(created_at) = v_date;
  
  SELECT COUNT(*) INTO v_total_feedback
  FROM candidate_feedback
  WHERE DATE(feedback_date) = v_date;
  
  SELECT 
    COUNT(*) FILTER (WHERE ai_accuracy = 'accurate'),
    COUNT(*) FILTER (WHERE ai_accuracy = 'partial'),
    COUNT(*) FILTER (WHERE ai_accuracy = 'inaccurate'),
    COUNT(*) FILTER (WHERE actual_role_assigned IS NOT NULL AND actual_role_assigned != recommended_role_was)
  INTO v_accurate, v_partial, v_inaccurate, v_overrides
  FROM candidate_feedback
  WHERE DATE(feedback_date) <= v_date;
  
  -- Get 6-month performance metrics
  SELECT 
    AVG(six_month_performance_rating),
    COUNT(*) FILTER (WHERE is_still_active = true),
    COUNT(*)
  INTO v_avg_rating, v_active_count, v_total_reviewed
  FROM candidate_feedback
  WHERE six_month_review_date IS NOT NULL
    AND DATE(six_month_review_date) <= v_date;
  
  -- Insert or update metrics
  INSERT INTO validation_metrics (
    metric_date,
    total_assessments,
    total_with_feedback,
    accurate_predictions,
    partial_predictions,
    inaccurate_predictions,
    recommendation_accuracy_percent,
    override_rate_percent,
    avg_six_month_rating,
    retention_rate_percent
  ) VALUES (
    v_date,
    v_total_assessments,
    v_total_feedback,
    v_accurate,
    v_partial,
    v_inaccurate,
    CASE WHEN v_total_feedback > 0 
      THEN ROUND((v_accurate::DECIMAL / v_total_feedback) * 100, 2)
      ELSE 0 
    END,
    CASE WHEN v_total_feedback > 0
      THEN ROUND((v_overrides::DECIMAL / v_total_feedback) * 100, 2)
      ELSE 0
    END,
    v_avg_rating,
    CASE WHEN v_total_reviewed > 0
      THEN ROUND((v_active_count::DECIMAL / v_total_reviewed) * 100, 2)
      ELSE 0
    END
  )
  ON CONFLICT (metric_date) 
  DO UPDATE SET
    total_assessments = EXCLUDED.total_assessments,
    total_with_feedback = EXCLUDED.total_with_feedback,
    accurate_predictions = EXCLUDED.accurate_predictions,
    partial_predictions = EXCLUDED.partial_predictions,
    inaccurate_predictions = EXCLUDED.inaccurate_predictions,
    recommendation_accuracy_percent = EXCLUDED.recommendation_accuracy_percent,
    override_rate_percent = EXCLUDED.override_rate_percent,
    avg_six_month_rating = EXCLUDED.avg_six_month_rating,
    retention_rate_percent = EXCLUDED.retention_rate_percent;
END;
$$;