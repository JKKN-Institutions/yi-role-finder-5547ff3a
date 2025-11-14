import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { WillSkillMatrix } from './WillSkillMatrix';
import { RealtimeAssessmentWidget } from './RealtimeAssessmentWidget';

interface DashboardStats {
  totalSubmissions: number;
  q1Stars: number;
  q2Willing: number;
  q3NotReady: number;
  q4Reluctant: number;
  completionRate: number;
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSubmissions: 0,
    q1Stars: 0,
    q2Willing: 0,
    q3NotReady: 0,
    q4Reluctant: 0,
    completionRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch all assessments
      const { data: assessments, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*');

      if (assessmentsError) throw assessmentsError;

      // Fetch all results with quadrants
      const { data: results, error: resultsError } = await supabase
        .from('assessment_results')
        .select('quadrant');

      if (resultsError) throw resultsError;

      const total = assessments?.length || 0;
      const completed = assessments?.filter(a => a.status === 'completed' || a.status === 'analyzed').length || 0;
      
      const q1 = results?.filter(r => r.quadrant === 'Q1 - STAR').length || 0;
      const q2 = results?.filter(r => r.quadrant === 'Q2 - WILLING').length || 0;
      const q3 = results?.filter(r => r.quadrant === 'Q3 - NOT READY').length || 0;
      const q4 = results?.filter(r => r.quadrant === 'Q4 - RELUCTANT').length || 0;

      setStats({
        totalSubmissions: completed,
        q1Stars: q1,
        q2Willing: q2,
        q3NotReady: q3,
        q4Reluctant: q4,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      icon: TrendingUp,
      color: 'text-primary',
    },
    {
      title: 'Q1 Stars',
      value: stats.q1Stars,
      icon: Star,
      color: 'text-yellow-500',
      subtitle: '⭐ High Will + High Skill',
    },
    {
      title: 'Q2 Willing',
      value: stats.q2Willing,
      icon: TrendingUp,
      color: 'text-green-500',
      subtitle: '💪 High Will + Developing Skill',
    },
    {
      title: 'Q3 Not Ready',
      value: stats.q3NotReady,
      icon: Clock,
      color: 'text-orange-500',
      subtitle: '⏸️ Need More Time',
    },
    {
      title: 'Q4 Reluctant',
      value: stats.q4Reluctant,
      icon: AlertCircle,
      color: 'text-blue-500',
      subtitle: '🤔 High Skill + Lower Will',
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: TrendingUp,
      color: 'text-primary',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Widget */}
      <RealtimeAssessmentWidget />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Will-Skill Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Will-Skill Matrix</CardTitle>
          <p className="text-sm text-muted-foreground">
            Interactive plot showing all candidates by WILL and SKILL scores
          </p>
        </CardHeader>
        <CardContent>
          <WillSkillMatrix />
        </CardContent>
      </Card>
    </div>
  );
}
