export interface AssessmentResponse {
  question_number: number;
  question_text: string;
  response_data: any;
}

export interface Assessment {
  id: string;
  user_email: string;
  status: 'in_progress' | 'completed' | 'analyzed';
  current_question: number;
  created_at: string;
  completed_at?: string;
}

export interface AssessmentResult {
  id: string;
  assessment_id: string;
  will_score: number;
  skill_score: number;
  quadrant: string;
  recommended_role: string;
  role_explanation: string;
  vertical_matches: string[];
  leadership_style: string;
  recommendations: Array<{
    role: string;
    confidence: number;
    reason: string;
  }>;
  reasoning: string;
  key_insights: {
    commitment_level: string;
    skill_readiness: string;
    growth_potential: string;
    strengths: string[];
    development_areas: string[];
  };
}

export const VERTICALS = [
  'Masoom',
  'Road Safety',
  'Climate Change',
  'Thalir',
  'Yuva',
  'Health',
  'Innovation',
  'Sports',
  'Membership'
] as const;

export const VERTICAL_DESCRIPTIONS = {
  'Masoom': 'Child welfare and education programs',
  'Road Safety': 'Community road safety awareness and enforcement',
  'Climate Change': 'Environmental sustainability and green initiatives',
  'Thalir': 'Youth empowerment and skill development',
  'Yuva': 'Young professional networking and leadership',
  'Health': 'Public health awareness and medical camps',
  'Innovation': 'Technology and entrepreneurship initiatives',
  'Sports': 'Sports events and fitness programs',
  'Membership': 'Member engagement and community building'
};