import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!supabaseUrl || !supabaseKey || !lovableApiKey) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all feedback data
    const { data: feedback, error: feedbackError } = await supabase
      .from('candidate_feedback')
      .select(`
        *,
        assessments!candidate_feedback_assessment_id_fkey (
          user_email,
          created_at
        ),
        assessment_results!inner (
          will_score,
          skill_score,
          quadrant,
          recommendations,
          key_insights
        )
      `);

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw feedbackError;
    }

    console.log(`Analyzing ${feedback?.length || 0} feedback entries`);

    // Analyze patterns using Lovable AI
    const analysisPrompt = `You are an AI model optimization specialist analyzing leadership feedback on candidate assessments.

FEEDBACK DATA:
${JSON.stringify(feedback, null, 2)}

ANALYSIS TASKS:
1. ACCURACY PATTERNS: Identify when AI predictions were accurate vs inaccurate
2. SCORING ADJUSTMENTS: Suggest weight adjustments for WILL/SKILL scoring
3. QUESTION IMPROVEMENTS: Recommend changes to assessment questions
4. INFERENCE GAPS: Find patterns in override reasoning
5. PERFORMANCE CORRELATION: Analyze 6-month performance vs initial scores

OUTPUT FORMAT (JSON):
{
  "accuracy_insights": {
    "overall_accuracy": "percentage",
    "common_success_patterns": ["pattern1", "pattern2"],
    "common_failure_patterns": ["pattern1", "pattern2"]
  },
  "scoring_adjustments": {
    "will_score_weight_changes": {"question_2": "+5", "question_3": "-3"},
    "skill_inference_improvements": ["improvement1", "improvement2"]
  },
  "question_recommendations": [
    {
      "question_number": 2,
      "current_issue": "Too binary, not capturing nuance",
      "suggested_change": "Add follow-up question about constraints",
      "expected_impact": "Better WILL score accuracy"
    }
  ],
  "override_patterns": [
    {
      "pattern": "High SKILL but selected for lower role",
      "frequency": 15,
      "reasoning": "Candidates prefer starting smaller"
    }
  ],
  "performance_correlation": {
    "high_will_high_skill_retention": "95%",
    "key_predictors_of_success": ["achievement specificity", "constraint handling"],
    "red_flags_identified": ["vague goals", "no solution in Q4"]
  },
  "recommended_actions": [
    "Increase weight of Q3 achievement detail by 10%",
    "Add bonus points for solution-oriented Q4 responses",
    "Create new question about past volunteer experience"
  ]
}

Provide actionable, data-driven insights for continuous improvement.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an expert AI model optimization specialist. Analyze feedback data and provide structured improvement recommendations in valid JSON format.' },
          { role: 'user', content: analysisPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI analysis failed: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysisText = aiData.choices[0].message.content;
    
    console.log('AI Analysis generated:', analysisText.substring(0, 200));

    // Try to parse JSON from the response
    let insights;
    try {
      // Remove markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : analysisText;
      insights = JSON.parse(jsonText);
    } catch (parseError) {
      console.warn('Failed to parse AI response as JSON, returning raw text');
      insights = {
        raw_analysis: analysisText,
        parsing_note: 'AI response was not valid JSON, included as raw text'
      };
    }

    // Calculate current metrics
    const totalFeedback = feedback?.length || 0;
    const accurateCount = feedback?.filter(f => f.ai_accuracy === 'accurate').length || 0;
    const overrideCount = feedback?.filter(f => f.actual_role_assigned && f.actual_role_assigned !== f.recommended_role_was).length || 0;
    
    const metrics = {
      total_feedback: totalFeedback,
      accuracy_rate: totalFeedback > 0 ? Math.round((accurateCount / totalFeedback) * 100) : 0,
      override_rate: totalFeedback > 0 ? Math.round((overrideCount / totalFeedback) * 100) : 0,
      analyzed_at: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        insights,
        metrics,
        feedback_count: totalFeedback,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in analyze-feedback function:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
