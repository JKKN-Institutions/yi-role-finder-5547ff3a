import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Star, Mail, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FeedbackForm } from './FeedbackForm';

export function CandidateDetail() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('new');
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [verticalNames, setVerticalNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (assessmentId) {
      fetchCandidateDetails();
    }
  }, [assessmentId]);

  const fetchCandidateDetails = async () => {
    try {
      // Fetch assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (assessmentError) throw assessmentError;

      // Fetch results
      const { data: result, error: resultError } = await supabase
        .from('assessment_results')
        .select('*')
        .eq('assessment_id', assessmentId)
        .single();

      if (resultError) throw resultError;

      // Fetch responses
      const { data: responseData, error: responsesError } = await supabase
        .from('assessment_responses')
        .select('*')
        .eq('assessment_id', assessmentId)
        .order('question_number');

      if (responsesError) throw responsesError;

      // Fetch vertical names
      const { data: verticalsData } = await supabase
        .from('verticals')
        .select('id, name');
      
      const verticalMap: Record<string, string> = {};
      verticalsData?.forEach(v => {
        verticalMap[v.id] = v.name;
      });

      setCandidate({ ...assessment, ...result });
      setResponses(responseData || []);
      setVerticalNames(verticalMap);
      setAdminNotes(assessment.admin_notes || '');
      setReviewStatus(assessment.review_status || 'new');
      setIsShortlisted(assessment.is_shortlisted || false);
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load candidate details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('assessments')
        .update({
          admin_notes: adminNotes,
          review_status: reviewStatus,
          is_shortlisted: isShortlisted,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', assessmentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Changes saved successfully',
      });
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Candidate not found</p>
        <Button onClick={() => navigate('/admin')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{candidate.user_email}</h1>
              <p className="text-muted-foreground">Candidate Assessment Details</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isShortlisted ? 'default' : 'outline'}
                onClick={() => setIsShortlisted(!isShortlisted)}
              >
                <Star className={`w-4 h-4 mr-2 ${isShortlisted ? 'fill-current' : ''}`} />
                {isShortlisted ? 'Shortlisted' : 'Add to Shortlist'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left Panel - Profile & Scores */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{candidate.user_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">WILL Score</span>
                    <span className="text-sm font-bold">{candidate.will_score}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${candidate.will_score}%` }}
                    />
                  </div>
                  {candidate.scoring_breakdown?.will && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Q2 Commitment:</span>
                        <span>{candidate.scoring_breakdown.will.breakdown.q2_commitment}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Q3 Achievement:</span>
                        <span>{candidate.scoring_breakdown.will.breakdown.q3_achievement}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Q4 Constraints:</span>
                        <span>{candidate.scoring_breakdown.will.breakdown.q4_constraints}/30</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Q5 Leadership:</span>
                        <span>{candidate.scoring_breakdown.will.breakdown.q5_leadership}/20</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">SKILL Score</span>
                    <span className="text-sm font-bold">{candidate.skill_score}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${candidate.skill_score}%` }}
                    />
                  </div>
                  {candidate.scoring_breakdown?.skill && (
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sophistication:</span>
                        <span>{candidate.scoring_breakdown.skill.breakdown.sophistication}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Strategic:</span>
                        <span>{candidate.scoring_breakdown.skill.breakdown.strategic_thinking}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Outcome Focus:</span>
                        <span>{candidate.scoring_breakdown.skill.breakdown.outcome_orientation}/25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Leadership:</span>
                        <span>{candidate.scoring_breakdown.skill.breakdown.leadership_signals}/25</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-2">
                  <Badge className="w-full justify-center py-2">{candidate.quadrant}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Vertical Preferences Card */}
            {candidate.vertical_matches && candidate.vertical_matches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Vertical Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {candidate.vertical_matches.map((verticalId: string, index: number) => (
                    <div key={verticalId} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm">
                        {verticalNames[verticalId] || verticalId}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Center Panel - AI Analysis & Responses */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Recommended Role</h4>
                  <p className="text-sm">{candidate.recommended_role}</p>
                </div>
                {candidate.reasoning && (
                  <div>
                    <h4 className="font-semibold mb-2">Reasoning</h4>
                    <p className="text-sm text-muted-foreground">{candidate.reasoning}</p>
                  </div>
                )}
                {candidate.key_insights && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Insights</h4>
                    <ul className="text-sm space-y-1">
                      {Object.entries(candidate.key_insights).map(([key, value]: [string, any]) => (
                        <li key={key} className="text-muted-foreground">
                          <strong>{key.replace(/_/g, ' ')}:</strong> {
                            Array.isArray(value) ? value.join(', ') : value
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Assessment Responses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {responses.map((response, index) => (
                  <div key={response.id} className="border-b pb-4 last:border-0">
                    <h4 className="font-semibold mb-2">
                      Q{response.question_number}: {response.question_text}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {JSON.stringify(response.response_data, null, 2)}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Admin Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Review Status</label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add private notes about this candidate..."
                    rows={4}
                  />
                </div>
                <Button onClick={handleSaveChanges} className="w-full">
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            <FeedbackForm
              assessmentId={assessmentId!}
              recommendedRole={candidate.recommended_role}
              onFeedbackSubmitted={fetchCandidateDetails}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
