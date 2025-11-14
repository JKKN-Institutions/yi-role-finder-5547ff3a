import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, TrendingUp, Users } from 'lucide-react';

interface HireRecord {
  id: string;
  assessment_id: string;
  user_email: string;
  recommended_role: string;
  actual_role_assigned: string | null;
  actual_vertical_assigned: string | null;
  actual_hire_date: string | null;
  ai_accuracy: string | null;
  hire_confidence_match: boolean | null;
  performance_notes: string | null;
}

export function HireTracking() {
  const { toast } = useToast();
  const [hireRecords, setHireRecords] = useState<HireRecord[]>([]);
  const [verticals, setVerticals] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<HireRecord | null>(null);
  const [stats, setStats] = useState({
    totalHired: 0,
    accurateMatches: 0,
    accuracyRate: 0,
    avgConfidenceMatch: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch hire records
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('candidate_feedback')
        .select(`
          id,
          assessment_id,
          recommended_role_was,
          actual_role_assigned,
          actual_vertical_assigned,
          actual_hire_date,
          ai_accuracy,
          hire_confidence_match,
          performance_notes,
          assessments (
            user_email
          )
        `)
        .not('actual_hire_date', 'is', null)
        .order('actual_hire_date', { ascending: false });

      if (feedbackError) throw feedbackError;

      const formatted = feedbackData?.map(f => ({
        id: f.id,
        assessment_id: f.assessment_id,
        user_email: (f.assessments as any)?.user_email || 'Unknown',
        recommended_role: f.recommended_role_was || 'N/A',
        actual_role_assigned: f.actual_role_assigned,
        actual_vertical_assigned: f.actual_vertical_assigned,
        actual_hire_date: f.actual_hire_date,
        ai_accuracy: f.ai_accuracy,
        hire_confidence_match: f.hire_confidence_match,
        performance_notes: f.performance_notes,
      })) || [];

      setHireRecords(formatted);

      // Calculate stats
      const totalHired = formatted.length;
      const accurateMatches = formatted.filter(r => r.ai_accuracy === 'accurate').length;
      const confidenceMatches = formatted.filter(r => r.hire_confidence_match === true).length;
      
      setStats({
        totalHired,
        accurateMatches,
        accuracyRate: totalHired > 0 ? Math.round((accurateMatches / totalHired) * 100) : 0,
        avgConfidenceMatch: totalHired > 0 ? Math.round((confidenceMatches / totalHired) * 100) : 0,
      });

      // Fetch verticals
      const { data: verticalsData } = await supabase
        .from('verticals')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order');
      if (verticalsData) setVerticals(verticalsData);

    } catch (error) {
      console.error('Error fetching hire tracking data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hire tracking data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateHireRecord = async (
    feedbackId: string,
    updates: Partial<HireRecord>
  ) => {
    try {
      const { error } = await supabase
        .from('candidate_feedback')
        .update(updates)
        .eq('id', feedbackId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Hire record updated successfully',
      });

      fetchData();
      setSelectedRecord(null);
    } catch (error) {
      console.error('Error updating hire record:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hire record',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hired</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accurate Predictions</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accurateMatches}</div>
            <p className="text-xs text-muted-foreground">
              {stats.accuracyRate}% accuracy rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Match</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgConfidenceMatch}%</div>
            <p className="text-xs text-muted-foreground">
              Role confidence aligned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Model Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.accuracyRate >= 70 ? 'Excellent' : stats.accuracyRate >= 50 ? 'Good' : 'Needs Improvement'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hire Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Hire Tracking Records</CardTitle>
          <CardDescription>
            Track actual hires vs AI recommendations to improve future assessments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>AI Recommended</TableHead>
                <TableHead>Actually Hired As</TableHead>
                <TableHead>Vertical</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hireRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hire records yet. Start tracking candidate outcomes!
                  </TableCell>
                </TableRow>
              ) : (
                hireRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.user_email}</TableCell>
                    <TableCell>{record.recommended_role}</TableCell>
                    <TableCell>{record.actual_role_assigned || '-'}</TableCell>
                    <TableCell>
                      {record.actual_vertical_assigned 
                        ? verticals.find(v => v.id === record.actual_vertical_assigned)?.name || record.actual_vertical_assigned
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.actual_hire_date 
                        ? new Date(record.actual_hire_date).toLocaleDateString()
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {record.ai_accuracy === 'accurate' && (
                        <Badge className="bg-green-500">Accurate</Badge>
                      )}
                      {record.ai_accuracy === 'partial' && (
                        <Badge className="bg-yellow-500">Partial</Badge>
                      )}
                      {record.ai_accuracy === 'inaccurate' && (
                        <Badge className="bg-red-500">Inaccurate</Badge>
                      )}
                      {!record.ai_accuracy && <Badge variant="outline">Pending</Badge>}
                    </TableCell>
                    <TableCell>
                      {record.hire_confidence_match === true && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                      {record.hire_confidence_match === false && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      {record.hire_confidence_match === null && (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
