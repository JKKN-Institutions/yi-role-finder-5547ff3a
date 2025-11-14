import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, TrendingUp, Target, Award, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  assessment_id: string;
  user_email: string;
  will_score: number;
  skill_score: number;
  quadrant: string;
  recommended_role: string;
  recommendations: Array<{ role: string; confidence: number; reason: string }>;
  vertical_matches: string[];
  leadership_style: string;
  scoring_breakdown: any;
  created_at: string;
}

interface ComparisonSlot {
  candidate: Candidate | null;
  index: number;
}

export function CandidateComparison() {
  const { toast } = useToast();
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [verticalNames, setVerticalNames] = useState<Record<string, string>>({});
  const [comparisonSlots, setComparisonSlots] = useState<ComparisonSlot[]>([
    { candidate: null, index: 0 },
    { candidate: null, index: 1 },
    { candidate: null, index: 2 },
    { candidate: null, index: 3 },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all candidates
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select(`
          id,
          assessment_id,
          will_score,
          skill_score,
          quadrant,
          recommended_role,
          recommendations,
          vertical_matches,
          leadership_style,
          scoring_breakdown,
          assessments (
            user_email,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = results?.map(r => ({
        id: r.id,
        assessment_id: r.assessment_id,
        user_email: (r.assessments as any)?.user_email || 'Anonymous',
        will_score: r.will_score || 0,
        skill_score: r.skill_score || 0,
        quadrant: r.quadrant || '',
        recommended_role: r.recommended_role || 'N/A',
        recommendations: r.recommendations as any || [],
        vertical_matches: r.vertical_matches || [],
        leadership_style: r.leadership_style || 'Unknown',
        scoring_breakdown: r.scoring_breakdown || null,
        created_at: (r.assessments as any)?.created_at || '',
      })) || [];

      setAllCandidates(formatted);

      // Fetch verticals
      const { data: verticalsData } = await supabase
        .from('verticals')
        .select('id, name');
      
      const verticalMap: Record<string, string> = {};
      verticalsData?.forEach(v => {
        verticalMap[v.id] = v.name;
      });
      setVerticalNames(verticalMap);

    } catch (error) {
      console.error('Error fetching comparison data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load candidates for comparison',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectCandidate = (slotIndex: number, candidateId: string) => {
    const candidate = allCandidates.find(c => c.id === candidateId);
    if (candidate) {
      setComparisonSlots(prev =>
        prev.map((slot, i) =>
          i === slotIndex ? { ...slot, candidate } : slot
        )
      );
    }
  };

  const removeCandidate = (slotIndex: number) => {
    setComparisonSlots(prev =>
      prev.map((slot, i) =>
        i === slotIndex ? { ...slot, candidate: null } : slot
      )
    );
  };

  const getQuadrantColor = (quadrant: string) => {
    if (quadrant.includes('Q1')) return 'bg-yellow-500';
    if (quadrant.includes('Q2')) return 'bg-green-500';
    if (quadrant.includes('Q3')) return 'bg-orange-500';
    if (quadrant.includes('Q4')) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const activeCandidates = comparisonSlots.filter(slot => slot.candidate !== null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Candidate Comparison</h2>
          <p className="text-muted-foreground">
            Compare up to 4 candidates side-by-side
          </p>
        </div>
        <Badge variant="outline" className="text-lg">
          {activeCandidates.length} / 4 Selected
        </Badge>
      </div>

      {/* Candidate Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparisonSlots.map((slot) => (
          <Card key={slot.index} className="relative">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Candidate {slot.index + 1}</CardTitle>
            </CardHeader>
            <CardContent>
              {slot.candidate ? (
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {slot.candidate.user_email}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeCandidate(slot.index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge className={getQuadrantColor(slot.candidate.quadrant)}>
                    {slot.candidate.quadrant}
                  </Badge>
                </div>
              ) : (
                <Select onValueChange={(value) => selectCandidate(slot.index, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allCandidates
                      .filter(c => !comparisonSlots.some(s => s.candidate?.id === c.id))
                      .map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.user_email} - {c.quadrant}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {activeCandidates.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Select candidates above to begin comparison</p>
          </div>
        </Card>
      )}

      {/* Comparison Grid */}
      {activeCandidates.length > 0 && (
        <div className="space-y-6">
          {/* Scores Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${activeCandidates.length}, 1fr)` }}>
                {activeCandidates.map(({ candidate }) => candidate && (
                  <div key={candidate.id} className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm font-medium mb-2">{candidate.user_email}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>WILL</span>
                          <span className="font-bold">{candidate.will_score}%</span>
                        </div>
                        <div className="w-full bg-secondary h-3 rounded-full">
                          <div
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${candidate.will_score}%` }}
                          />
                        </div>
                        {candidate.scoring_breakdown?.will && (
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <div>Q2: {candidate.scoring_breakdown.will.breakdown.q2_commitment}/25</div>
                            <div>Q3: {candidate.scoring_breakdown.will.breakdown.q3_achievement}/25</div>
                            <div>Q4: {candidate.scoring_breakdown.will.breakdown.q4_constraints}/30</div>
                            <div>Q5: {candidate.scoring_breakdown.will.breakdown.q5_leadership}/20</div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>SKILL</span>
                          <span className="font-bold">{candidate.skill_score}%</span>
                        </div>
                        <div className="w-full bg-secondary h-3 rounded-full">
                          <div
                            className="bg-primary h-3 rounded-full transition-all"
                            style={{ width: `${candidate.skill_score}%` }}
                          />
                        </div>
                        {candidate.scoring_breakdown?.skill && (
                          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                            <div>Sophistication: {candidate.scoring_breakdown.skill.breakdown.sophistication}/25</div>
                            <div>Strategic: {candidate.scoring_breakdown.skill.breakdown.strategic_thinking}/25</div>
                            <div>Outcome: {candidate.scoring_breakdown.skill.breakdown.outcome_orientation}/25</div>
                            <div>Leadership: {candidate.scoring_breakdown.skill.breakdown.leadership_signals}/25</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Recommended Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${activeCandidates.length}, 1fr)` }}>
                {activeCandidates.map(({ candidate }) => candidate && (
                  <div key={candidate.id} className="space-y-3">
                    <div className="text-center font-medium text-sm border-b pb-2">
                      {candidate.user_email}
                    </div>
                    <div className="space-y-2">
                      {candidate.recommendations.slice(0, 3).map((rec, idx) => (
                        <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-semibold">{rec.role}</span>
                            <Badge variant="outline" className="text-xs">
                              {rec.confidence}%
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{rec.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Verticals & Leadership Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Preferences & Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${activeCandidates.length}, 1fr)` }}>
                {activeCandidates.map(({ candidate }) => candidate && (
                  <div key={candidate.id} className="space-y-4">
                    <div className="text-center font-medium text-sm border-b pb-2">
                      {candidate.user_email}
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold mb-2">Vertical Preferences</p>
                      <div className="space-y-1">
                        {candidate.vertical_matches.map((vId, idx) => (
                          <div key={vId} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center p-0">
                              {idx + 1}
                            </Badge>
                            <span className="text-sm">{verticalNames[vId] || vId}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold mb-2">Leadership Style</p>
                      <Badge className="text-xs capitalize">
                        {candidate.leadership_style}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
