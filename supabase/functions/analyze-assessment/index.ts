import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WillScoreResult {
  total: number;
  breakdown: {
    q2_commitment: number;
    q3_achievement: number;
    q4_constraints: number;
    q5_leadership: number;
  };
}

interface SkillAnalysis {
  total: number;
  breakdown: {
    sophistication: number;
    strategic_thinking: number;
    outcome_orientation: number;
    leadership_signals: number;
  };
  rationale: string;
}

interface Recommendation {
  role: string;
  confidence: number;
  reason: string;
}

function calculateWillScore(responses: any[]): WillScoreResult {
  let total = 0;
  const breakdown = {
    q2_commitment: 0,
    q3_achievement: 0,
    q4_constraints: 0,
    q5_leadership: 0
  };

  // Question 2 - Saturday scenario analysis
  const q2 = responses.find(r => r.question_number === 2);
  if (q2?.response_data?.text) {
    const text = q2.response_data.text.toLowerCase();
    if (text.match(/\b(yes|absolutely|count me in|i'm there|immediately)\b/)) {
      breakdown.q2_commitment = 25;
    } else if (text.match(/\b(if|depends|need to|let me|check)\b/)) {
      breakdown.q2_commitment = 15;
    } else if (text.match(/\b(what|who|when|where|how)\b.*\?/)) {
      breakdown.q2_commitment = 10;
    } else {
      breakdown.q2_commitment = 5;
    }
  }

  // Question 3 - Achievement frame analysis
  const q3 = responses.find(r => r.question_number === 3);
  if (q3?.response_data?.text) {
    const text = q3.response_data.text.toLowerCase();
    const hasNumbers = /\d+/.test(text);
    const hasActionVerbs = text.match(/\b(built|launched|created|trained|achieved|completed|delivered)\b/);
    const hasHedging = text.match(/\b(try|hopefully|maybe|might|should)\b/);
    
    if (hasNumbers && hasActionVerbs && !hasHedging) {
      breakdown.q3_achievement = 25;
    } else if (hasNumbers || hasActionVerbs) {
      breakdown.q3_achievement = 15;
    } else {
      breakdown.q3_achievement = 5;
    }
  }

  // Question 4 - Constraints
  const q4 = responses.find(r => r.question_number === 4);
  if (q4?.response_data) {
    const constraint = q4.response_data.constraint;
    if (constraint === 'none') breakdown.q4_constraints = 20;
    else if (constraint === 'time') breakdown.q4_constraints = 15;
    else if (constraint === 'expectations') breakdown.q4_constraints = 10;
    else breakdown.q4_constraints = 5;
    
    // Bonus for providing solution
    if (q4.response_data.handling && q4.response_data.handling.trim().length > 10) {
      breakdown.q4_constraints += 10;
    }
  }

  // Question 5 - Leadership style
  const q5 = responses.find(r => r.question_number === 5);
  if (q5?.response_data?.leadership_style) {
    const style = q5.response_data.leadership_style;
    if (style === 'leader' || style === 'strategic') {
      breakdown.q5_leadership = 20;
    } else if (style === 'doer') {
      breakdown.q5_leadership = 15;
    } else if (style === 'learning') {
      breakdown.q5_leadership = 10;
    }
  }

  total = breakdown.q2_commitment + breakdown.q3_achievement + 
          breakdown.q4_constraints + breakdown.q5_leadership;

  return { total, breakdown };
}

async function analyzeSkillScore(responses: any[], lovableApiKey: string): Promise<SkillAnalysis> {
  const analysisPrompt = `Analyze these assessment responses for SKILL level indicators. Score each dimension 0-25 points:

RESPONSES:
${responses.map(r => `Q${r.question_number}: ${JSON.stringify(r.response_data)}`).join('\n')}

SCORING CRITERIA:

1. Response Sophistication (0-25):
- Grammar, structure, clarity
- Use of specific technical/domain terms
- Problem-solving language vs. vague statements

2. Strategic Thinking (0-25):
- Asks clarifying questions
- Considers multiple factors (budget, team, timeline)
- Shows systems thinking beyond immediate task

3. Outcome Orientation (0-25):
- Uses measurable goals and metrics
- Includes specific numbers/targets
- Action verbs (built, launched, trained) vs. passive language

4. Leadership Signals (0-25):
- Team-oriented language (we, our, together)
- Takes ownership and responsibility
- Solution-focused rather than problem-focused

Return ONLY valid JSON with this structure:
{
  "sophistication": <0-25>,
  "strategic_thinking": <0-25>,
  "outcome_orientation": <0-25>,
  "leadership_signals": <0-25>,
  "rationale": "<2 sentences explaining the scores>"
}`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are an expert HR analyst. Return ONLY valid JSON.' },
        { role: 'user', content: analysisPrompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const result = JSON.parse(content);

  return {
    total: result.sophistication + result.strategic_thinking + 
           result.outcome_orientation + result.leadership_signals,
    breakdown: {
      sophistication: result.sophistication,
      strategic_thinking: result.strategic_thinking,
      outcome_orientation: result.outcome_orientation,
      leadership_signals: result.leadership_signals,
    },
    rationale: result.rationale
  };
}

function determineQuadrant(willPercent: number, skillPercent: number): string {
  if (skillPercent >= 70 && willPercent >= 70) return 'Q1 - STAR';
  if (skillPercent < 70 && willPercent >= 70) return 'Q2 - WILLING';
  if (skillPercent >= 70 && willPercent < 70) return 'Q4 - RELUCTANT';
  return 'Q3 - NOT READY';
}

function generateRecommendations(
  quadrant: string,
  verticals: string[],
  leadershipStyle: string
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const topVertical = verticals[0] || 'General';

  if (quadrant === 'Q1 - STAR') {
    if (leadershipStyle === 'strategic') {
      recommendations.push({
        role: 'Co-Chair',
        confidence: 90,
        reason: 'Your strategic thinking and high commitment make you ideal for this leadership position'
      });
      recommendations.push({
        role: `${topVertical} Vertical Chair`,
        confidence: 85,
        reason: 'Strong passion for this vertical combined with leadership capabilities'
      });
      recommendations.push({
        role: 'Project Lead',
        confidence: 80,
        reason: 'Can handle independent initiatives with excellence'
      });
    } else if (leadershipStyle === 'leader') {
      recommendations.push({
        role: `${topVertical} Vertical Chair`,
        confidence: 85,
        reason: 'Natural leadership style paired with high skill and commitment'
      });
      recommendations.push({
        role: 'Co-Chair',
        confidence: 80,
        reason: 'Ready to take on significant organizational responsibilities'
      });
      recommendations.push({
        role: 'Multi-Vertical Coordinator',
        confidence: 75,
        reason: 'Can manage multiple initiatives effectively'
      });
    } else {
      recommendations.push({
        role: `${topVertical} Vertical Chair`,
        confidence: 80,
        reason: 'High execution capability with strong commitment'
      });
      recommendations.push({
        role: 'Co-Chair',
        confidence: 75,
        reason: 'Ready to step into major leadership role'
      });
      recommendations.push({
        role: 'Project Lead',
        confidence: 80,
        reason: 'Excellent at getting things done independently'
      });
    }
  } else if (quadrant === 'Q2 - WILLING') {
    if (leadershipStyle === 'leader' || leadershipStyle === 'strategic') {
      recommendations.push({
        role: `${topVertical} Vertical Co-Chair`,
        confidence: 85,
        reason: 'High commitment with leadership potential - excellent co-leadership fit'
      });
      recommendations.push({
        role: 'Team Lead',
        confidence: 80,
        reason: 'Strong willingness to lead smaller teams effectively'
      });
      recommendations.push({
        role: 'Active Volunteer',
        confidence: 75,
        reason: 'Can contribute significantly while building skills'
      });
    } else {
      recommendations.push({
        role: 'Active Volunteer',
        confidence: 90,
        reason: 'High energy and commitment will drive impact in volunteer role'
      });
      recommendations.push({
        role: 'Event Coordinator',
        confidence: 80,
        reason: 'Great at execution with strong follow-through'
      });
      recommendations.push({
        role: `${topVertical} Vertical Co-Chair`,
        confidence: 70,
        reason: 'Can grow into leadership with mentorship'
      });
    }
  } else if (quadrant === 'Q4 - RELUCTANT') {
    recommendations.push({
      role: 'Advisory Role',
      confidence: 70,
      reason: 'High skills can contribute through strategic guidance'
    });
    recommendations.push({
      role: 'Specific Project Lead',
      confidence: 60,
      reason: 'Can lead defined projects matching your expertise'
    });
    recommendations.push({
      role: 'Mentor',
      confidence: 65,
      reason: 'Skills make you valuable for coaching others'
    });
  } else {
    recommendations.push({
      role: 'General Volunteer',
      confidence: 80,
      reason: 'Start building experience and skills in supportive role'
    });
    recommendations.push({
      role: 'Shadow Program',
      confidence: 75,
      reason: 'Learn by observing experienced members'
    });
    recommendations.push({
      role: 'Wait for 2027',
      confidence: 70,
      reason: 'Use this year to develop skills and come back stronger'
    });
  }

  return recommendations;
}

async function generateReasoning(
  willScore: number,
  skillScore: number,
  quadrant: string,
  verticals: string[],
  leadershipStyle: string,
  recommendations: Recommendation[],
  lovableApiKey: string
): Promise<string> {
  const prompt = `Based on this Yi Erode EC 2026 assessment:

- WILL score: ${willScore}%
- SKILL score: ${skillScore}%
- Quadrant: ${quadrant}
- Vertical interests: ${verticals.join(', ')}
- Leadership style: ${leadershipStyle}
- Top recommendations: ${recommendations.map(r => r.role).join(', ')}

Generate a personalized 2-paragraph explanation (exactly 100 words total):

Paragraph 1 (50 words): Explain why they fit this quadrant, citing specific indicators from their WILL and SKILL scores.

Paragraph 2 (50 words): Explain why these 3 roles are recommended and what they should focus on to maximize impact.

Tone: Encouraging, specific, actionable. No generic platitudes.

Return ONLY the text, no JSON, no markdown.`;

  const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a Yi Erode EC advisor. Write concisely and specifically.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId } = await req.json();
    console.log('Analyzing assessment:', assessmentId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('question_number');

    if (responsesError) throw responsesError;
    if (!responses || responses.length !== 5) {
      throw new Error('Incomplete assessment - need all 5 responses');
    }

    console.log('Calculating WILL score...');
    const willResult = calculateWillScore(responses);
    const willPercent = Math.round((willResult.total / 90) * 100);

    console.log('Analyzing SKILL score with AI...');
    const skillAnalysis = await analyzeSkillScore(responses, lovableApiKey);
    const skillPercent = Math.round((skillAnalysis.total / 100) * 100);

    console.log('Determining quadrant...');
    const quadrant = determineQuadrant(willPercent, skillPercent);

    // Extract verticals and leadership style
    const q1 = responses.find(r => r.question_number === 1);
    const verticals = q1?.response_data || [];
    const q5 = responses.find(r => r.question_number === 5);
    const leadershipStyle = q5?.response_data?.leadership_style || 'unknown';

    console.log('Generating recommendations...');
    const recommendations = generateRecommendations(quadrant, verticals, leadershipStyle);

    console.log('Generating personalized reasoning...');
    const reasoning = await generateReasoning(
      willPercent,
      skillPercent,
      quadrant,
      verticals,
      leadershipStyle,
      recommendations,
      lovableApiKey
    );

    // Store results
    const { data: result, error: insertError } = await supabase
      .from('assessment_results')
      .insert({
        assessment_id: assessmentId,
        will_score: willPercent,
        skill_score: skillPercent,
        quadrant: quadrant,
        recommended_role: recommendations[0].role,
        role_explanation: recommendations[0].reason,
        vertical_matches: verticals,
        leadership_style: leadershipStyle,
        recommendations: recommendations,
        reasoning: reasoning,
        key_insights: {
          commitment_level: willPercent >= 70 ? 'high' : willPercent >= 50 ? 'medium' : 'low',
          skill_readiness: skillPercent >= 70 ? 'high' : skillPercent >= 50 ? 'medium' : 'low',
          growth_potential: skillAnalysis.total >= 75 ? 'high' : skillAnalysis.total >= 50 ? 'medium' : 'low',
          strengths: [
            willResult.breakdown.q2_commitment >= 20 ? 'Strong commitment to urgent needs' : null,
            willResult.breakdown.q3_achievement >= 20 ? 'Clear goal-oriented mindset' : null,
            skillAnalysis.breakdown.strategic_thinking >= 20 ? 'Strategic thinker' : null,
            skillAnalysis.breakdown.leadership_signals >= 20 ? 'Natural leadership qualities' : null,
          ].filter(Boolean),
          development_areas: [
            willResult.breakdown.q2_commitment < 15 ? 'Build stronger commitment signals' : null,
            skillAnalysis.breakdown.sophistication < 15 ? 'Enhance communication clarity' : null,
            skillAnalysis.breakdown.outcome_orientation < 15 ? 'Focus on measurable outcomes' : null,
          ].filter(Boolean),
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    await supabase
      .from('assessments')
      .update({ 
        status: 'analyzed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    console.log('Analysis complete!');
    console.log(`WILL: ${willPercent}%, SKILL: ${skillPercent}%, Quadrant: ${quadrant}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        result,
        scores: {
          will: willPercent,
          skill: skillPercent,
          quadrant: quadrant
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-assessment function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});