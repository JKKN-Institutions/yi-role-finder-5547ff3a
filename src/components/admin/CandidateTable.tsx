import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Star, Download, Filter, CheckSquare, Square, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { exportCandidatesData } from '@/utils/exportUtils';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  assessment_id: string;
  user_email: string;
  will_score: number;
  skill_score: number;
  quadrant: string;
  recommended_role: string;
  review_status: string;
  is_shortlisted: boolean;
  created_at: string;
  confidence: number;
  vertical_matches?: string[];
}

export function CandidateTable() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [quadrantFilter, setQuadrantFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verticalFilter, setVerticalFilter] = useState('all');
  const [verticals, setVerticals] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkReviewStatus, setBulkReviewStatus] = useState('');
  const [bulkNotes, setBulkNotes] = useState('');

  useEffect(() => {
    fetchCandidates();
    fetchVerticals();
  }, []);

  useEffect(() => {
    filterCandidates();
  }, [candidates, searchTerm, quadrantFilter, statusFilter, verticalFilter]);

  const fetchVerticals = async () => {
    const { data } = await supabase
      .from('verticals')
      .select('id, name')
      .eq('is_active', true)
      .order('display_order');
    if (data) setVerticals(data);
  };

  const fetchCandidates = async () => {
    try {
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
          assessments (
            user_email,
            review_status,
            is_shortlisted,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = results?.map(r => {
        const assessment = r.assessments as any;
        const recommendations = r.recommendations as any[];
        const topRecommendation = recommendations?.[0] || {};
        
        return {
          id: r.id,
          assessment_id: r.assessment_id,
          user_email: assessment?.user_email || 'Anonymous',
          will_score: r.will_score || 0,
          skill_score: r.skill_score || 0,
          quadrant: r.quadrant || '',
          recommended_role: r.recommended_role || 'N/A',
          review_status: assessment?.review_status || 'new',
          is_shortlisted: assessment?.is_shortlisted || false,
          created_at: assessment?.created_at || '',
          confidence: topRecommendation.confidence || 0,
          vertical_matches: r.vertical_matches || [],
        };
      }) || [];

      setCandidates(formattedData);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCandidates = () => {
    let filtered = [...candidates];

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.user_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (quadrantFilter !== 'all') {
      filtered = filtered.filter(c => c.quadrant.includes(quadrantFilter));
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.review_status === statusFilter);
    }

    if (verticalFilter !== 'all') {
      filtered = filtered.filter(c => 
        (c as any).vertical_matches?.includes(verticalFilter)
      );
    }

    setFilteredCandidates(filtered);
  };

  const getQuadrantBadge = (quadrant: string) => {
    if (quadrant.includes('Q1')) return <Badge className="bg-yellow-500">⭐ Q1 - STAR</Badge>;
    if (quadrant.includes('Q2')) return <Badge className="bg-green-500">💪 Q2 - WILLING</Badge>;
    if (quadrant.includes('Q3')) return <Badge className="bg-orange-500">⏸️ Q3 - NOT READY</Badge>;
    if (quadrant.includes('Q4')) return <Badge className="bg-blue-500">🤔 Q4 - RELUCTANT</Badge>;
    return <Badge variant="outline">{quadrant}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      new: 'default',
      reviewed: 'secondary',
      shortlisted: 'default',
      selected: 'default',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === filteredCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(filteredCandidates.map(c => c.assessment_id)));
    }
  };

  const toggleSelectCandidate = (assessmentId: string) => {
    const newSelected = new Set(selectedCandidates);
    if (newSelected.has(assessmentId)) {
      newSelected.delete(assessmentId);
    } else {
      newSelected.add(assessmentId);
    }
    setSelectedCandidates(newSelected);
  };

  const handleBulkAction = async () => {
    if (selectedCandidates.size === 0) {
      toast({
        title: 'No candidates selected',
        description: 'Please select at least one candidate',
        variant: 'destructive',
      });
      return;
    }

    try {
      const updates: any = {};
      if (bulkReviewStatus) updates.review_status = bulkReviewStatus;
      if (bulkNotes) updates.admin_notes = bulkNotes;
      updates.reviewed_at = new Date().toISOString();

      const { error } = await supabase
        .from('assessments')
        .update(updates)
        .in('id', Array.from(selectedCandidates));

      if (error) throw error;

      toast({
        title: 'Bulk action completed',
        description: `Updated ${selectedCandidates.size} candidate(s)`,
      });

      setShowBulkDialog(false);
      setBulkReviewStatus('');
      setBulkNotes('');
      setSelectedCandidates(new Set());
      fetchCandidates();
    } catch (error) {
      console.error('Error performing bulk action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update candidates',
        variant: 'destructive',
      });
    }
  };

  const clearSelection = () => {
    setSelectedCandidates(new Set());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {selectedCandidates.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="default" className="text-base px-4 py-2">
                  {selectedCandidates.size} Selected
                </Badge>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <CheckSquare className="w-4 h-4 mr-2" />
                      Bulk Update
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Bulk Update Candidates</DialogTitle>
                      <DialogDescription>
                        Update {selectedCandidates.size} selected candidate(s)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Review Status</label>
                        <Select value={bulkReviewStatus} onValueChange={setBulkReviewStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder="Change status..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewing">Reviewing</SelectItem>
                            <SelectItem value="interviewed">Interviewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Admin Notes</label>
                        <Textarea
                          placeholder="Add notes to all selected candidates..."
                          value={bulkNotes}
                          onChange={(e) => setBulkNotes(e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowBulkDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleBulkAction}>
                        Update {selectedCandidates.size} Candidate(s)
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={quadrantFilter} onValueChange={setQuadrantFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by quadrant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Quadrants</SelectItem>
            <SelectItem value="Q1">Q1 - STAR</SelectItem>
            <SelectItem value="Q2">Q2 - WILLING</SelectItem>
            <SelectItem value="Q3">Q3 - NOT READY</SelectItem>
            <SelectItem value="Q4">Q4 - RELUCTANT</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="shortlisted">Shortlisted</SelectItem>
            <SelectItem value="selected">Selected</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={verticalFilter} onValueChange={setVerticalFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by vertical" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Verticals</SelectItem>
            {verticals.map(v => (
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => exportCandidatesData(filteredCandidates)}
          disabled={filteredCandidates.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>WILL %</TableHead>
              <TableHead>SKILL %</TableHead>
              <TableHead>Quadrant</TableHead>
              <TableHead>Top Role</TableHead>
              <TableHead>Confidence</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCandidates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No candidates found
                </TableCell>
              </TableRow>
            ) : (
              filteredCandidates.map((candidate) => (
                <TableRow key={candidate.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {candidate.is_shortlisted && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      {candidate.user_email}
                    </div>
                  </TableCell>
                  <TableCell>{candidate.will_score}%</TableCell>
                  <TableCell>{candidate.skill_score}%</TableCell>
                  <TableCell>{getQuadrantBadge(candidate.quadrant)}</TableCell>
                  <TableCell>{candidate.recommended_role}</TableCell>
                  <TableCell>{candidate.confidence}%</TableCell>
                  <TableCell>{getStatusBadge(candidate.review_status)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/candidate/${candidate.assessment_id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
