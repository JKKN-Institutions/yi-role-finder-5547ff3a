import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface FeedbackFormProps {
  assessmentId: string;
  recommendedRole: string;
  onFeedbackSubmitted: () => void;
}

export function FeedbackForm({ assessmentId, recommendedRole, onFeedbackSubmitted }: FeedbackFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [aiAccuracy, setAiAccuracy] = useState<string>('');
  const [actualRole, setActualRole] = useState<string>('');
  const [overrideReasoning, setOverrideReasoning] = useState<string>('');
  const [sixMonthRating, setSixMonthRating] = useState<string>('');
  const [sixMonthNotes, setSixMonthNotes] = useState<string>('');
  const [isStillActive, setIsStillActive] = useState<boolean>(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiAccuracy) {
      toast({
        title: 'Required Field',
        description: 'Please indicate if AI recommendation was accurate',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData: any = {
        assessment_id: assessmentId,
        reviewer_id: user?.id,
        ai_accuracy: aiAccuracy,
        recommended_role_was: recommendedRole,
        actual_role_assigned: actualRole || null,
        override_reasoning: overrideReasoning || null,
      };

      // Add 6-month data if provided
      if (sixMonthRating) {
        feedbackData.six_month_performance_rating = parseInt(sixMonthRating);
        feedbackData.six_month_notes = sixMonthNotes || null;
        feedbackData.is_still_active = isStillActive;
        feedbackData.six_month_review_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('candidate_feedback')
        .insert(feedbackData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });

      // Reset form
      setAiAccuracy('');
      setActualRole('');
      setOverrideReasoning('');
      setSixMonthRating('');
      setSixMonthNotes('');
      setIsStillActive(true);

      onFeedbackSubmitted();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leadership Feedback</CardTitle>
        <p className="text-sm text-muted-foreground">
          Help improve AI recommendations by providing feedback on this candidate
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* AI Accuracy */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Was AI recommendation accurate?</Label>
            <RadioGroup value={aiAccuracy} onValueChange={setAiAccuracy}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="accurate" id="accurate" />
                <Label htmlFor="accurate" className="font-normal">
                  Yes - AI recommendation was spot on
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="partial" id="partial" />
                <Label htmlFor="partial" className="font-normal">
                  Partial - AI was close but needed adjustment
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inaccurate" id="inaccurate" />
                <Label htmlFor="inaccurate" className="font-normal">
                  No - AI recommendation was off
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Actual Role Assigned */}
          <div className="space-y-2">
            <Label htmlFor="actualRole">Actual Role Assigned</Label>
            <Input
              id="actualRole"
              placeholder="e.g., Chair, Co-Chair, Active Volunteer"
              value={actualRole}
              onChange={(e) => setActualRole(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              AI recommended: <strong>{recommendedRole}</strong>
            </p>
          </div>

          {/* Override Reasoning */}
          {actualRole && actualRole !== recommendedRole && (
            <div className="space-y-2">
              <Label htmlFor="overrideReasoning">Why did you override AI recommendation?</Label>
              <Textarea
                id="overrideReasoning"
                placeholder="Explain your reasoning for selecting a different role..."
                value={overrideReasoning}
                onChange={(e) => setOverrideReasoning(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* 6-Month Performance (Optional) */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="font-semibold">6-Month Follow-Up (Optional)</h4>
            
            <div className="space-y-2">
              <Label htmlFor="sixMonthRating">Performance Rating (1-5)</Label>
              <Select value={sixMonthRating} onValueChange={setSixMonthRating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isStillActive"
                checked={isStillActive}
                onCheckedChange={(checked) => setIsStillActive(checked as boolean)}
              />
              <Label htmlFor="isStillActive" className="font-normal">
                Candidate is still active in their role
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sixMonthNotes">6-Month Notes</Label>
              <Textarea
                id="sixMonthNotes"
                placeholder="Additional observations after 6 months..."
                value={sixMonthNotes}
                onChange={(e) => setSixMonthNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
