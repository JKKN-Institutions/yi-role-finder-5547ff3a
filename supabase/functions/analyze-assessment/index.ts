import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId } = await req.json();
    console.log('Analyzing assessment:', assessmentId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch assessment responses
    const { data: responses, error: responsesError } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('assessment_id', assessmentId)
      .order('question_number');

    if (responsesError) throw responsesError;
    if (!responses || responses.length === 0) {
      throw new Error('No responses found for assessment');
    }

    console.log('Responses retrieved:', responses.length);

    // Prepare AI analysis prompt
    const analysisPrompt = `You are an expert in analyzing Yi Erode EC member potential based on assessment responses. Analyze the following responses and provide a detailed role recommendation.

RESPONSES:
${responses.map((r, i) => `
Question ${i + 1}: ${r.question_text}
Answer: ${JSON.stringify(r.response_data, null, 2)}
`).join('\n')}

SCORING GUIDELINES:

Question 1 (Vertical Interest):
- 1 choice = Focused specialist (+15 SKILL)
- 3 related choices = Strategic thinker (+20 WILL, +15 SKILL)
- 3 random choices = Explorer/generalist (+10 WILL, +5 SKILL)

Question 2 (Commitment Scenario):
- Immediate "yes" language = High WILL (+25 points)
- Conditional responses = Moderate WILL (+15 points)
- Detailed explanation = High SKILL (+20 points)
- Questions about support = Low SKILL but willing (+10 WILL)
- Hedging language = Low WILL (+5 points)

Question 3 (Achievement Frame):
- Specific metrics = High SKILL (+20 points)
- Vague goals = Low SKILL (+5 points)
- Ambitious targets = High WILL (+20 points)
- Hedged language = Low WILL (+5 points)
- Action verbs = Leadership potential (+15 SKILL)

Question 4 (Constraint Reality):
- "None - I'm all in" = +20 WILL
- "Time but I'll manage" = +15 WILL
- "Need to understand expectations" = +10 WILL
- "Significant constraints" = +5 WILL
- Proactive solutions in optional text = +15 SKILL

Question 5 (Leadership Style):
- A (Jump in yourself) = Volunteer/Co-Chair (+15 SKILL, +10 WILL)
- B (Emergency meeting) = Vertical Chair (+20 WILL, +15 SKILL)
- C (Analyze process) = Co-Chair/future Chair (+25 SKILL, +15 WILL)
- D (Ask for mentorship) = Volunteer with high potential (+15 WILL, +10 SKILL)

ROLE RECOMMENDATIONS:
- WILL 70-100 + SKILL 70-100 = Vertical Chair
- WILL 60-100 + SKILL 50-69 = Co-Chair
- WILL 50-100 + SKILL 30-49 = Volunteer Lead
- WILL 30-59 + Any SKILL = Volunteer
- Below 30 WILL = Not recommended for EC 2026

Analyze the responses and return ONLY a valid JSON object with this EXACT structure (no markdown, no code blocks):
{
  "will_score": <number 0-100>,
  "skill_score": <number 0-100>,
  "recommended_role": "<Vertical Chair|Co-Chair|Volunteer Lead|Volunteer|Not Recommended>",
  "role_explanation": "<2-3 sentences explaining why this role fits>",
  "vertical_matches": ["<vertical1>", "<vertical2>", "<vertical3>"],
  "leadership_style": "<Doer|Leader|Strategic|Learning>",
  "key_insights": {
    "commitment_level": "<high|medium|low>",
    "skill_readiness": "<high|medium|low>",
    "growth_potential": "<high|medium|low>",
    "strengths": ["<strength1>", "<strength2>"],
    "development_areas": ["<area1>", "<area2>"]
  }
}`;

    // Call Lovable AI for analysis
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Calling Lovable AI for analysis...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert Yi Erode EC analyst. Return ONLY valid JSON, no markdown formatting.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log('AI response received');

    let analysisResult;
    try {
      const content = aiData.choices[0].message.content;
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysisResult = JSON.parse(cleanContent);
      console.log('Parsed analysis result:', analysisResult);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw content:', aiData.choices[0].message.content);
      throw new Error('Failed to parse AI analysis result');
    }

    // Store results in database
    const { data: result, error: insertError } = await supabase
      .from('assessment_results')
      .insert({
        assessment_id: assessmentId,
        will_score: analysisResult.will_score,
        skill_score: analysisResult.skill_score,
        recommended_role: analysisResult.recommended_role,
        role_explanation: analysisResult.role_explanation,
        vertical_matches: analysisResult.vertical_matches,
        leadership_style: analysisResult.leadership_style,
        key_insights: analysisResult.key_insights,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    // Update assessment status
    await supabase
      .from('assessments')
      .update({ 
        status: 'analyzed',
        completed_at: new Date().toISOString()
      })
      .eq('id', assessmentId);

    console.log('Analysis complete, results stored');

    return new Response(
      JSON.stringify({ success: true, result }),
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