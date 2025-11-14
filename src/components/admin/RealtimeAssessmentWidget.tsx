import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, TrendingUp, Clock } from "lucide-react";

interface AssessmentStats {
  inProgress: number;
  completedToday: number;
  avgCompletionTime: number;
  activeNow: number;
}

export const RealtimeAssessmentWidget = () => {
  const [stats, setStats] = useState<AssessmentStats>({
    inProgress: 0,
    completedToday: 0,
    avgCompletionTime: 0,
    activeNow: 0,
  });

  useEffect(() => {
    fetchStats();
    subscribeToChanges();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: inProgressData } = await supabase
        .from("assessments")
        .select("id")
        .eq("status", "in_progress");

      const { data: completedTodayData } = await supabase
        .from("assessments")
        .select("id, created_at, completed_at")
        .eq("status", "completed")
        .gte("completed_at", today.toISOString());

      const avgTime = calculateAvgCompletionTime(completedTodayData || []);

      const { data: recentActivity } = await supabase
        .from("assessments")
        .select("id, updated_at")
        .eq("status", "in_progress")
        .gte("updated_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

      setStats({
        inProgress: inProgressData?.length || 0,
        completedToday: completedTodayData?.length || 0,
        avgCompletionTime: avgTime,
        activeNow: recentActivity?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const calculateAvgCompletionTime = (assessments: any[]) => {
    if (!assessments.length) return 0;
    
    const times = assessments
      .filter(a => a.created_at && a.completed_at)
      .map(a => {
        const start = new Date(a.created_at).getTime();
        const end = new Date(a.completed_at).getTime();
        return (end - start) / 1000 / 60; // minutes
      });

    return times.length > 0 
      ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
      : 0;
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel("assessment-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "assessments",
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Live Assessment Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              Active Now
            </div>
            <div className="text-2xl font-bold">
              {stats.activeNow}
              <span className="text-sm text-green-500 ml-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1" />
                Live
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              In Progress
            </div>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4" />
              Completed Today
            </div>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Avg Time
            </div>
            <div className="text-2xl font-bold">
              {stats.avgCompletionTime}
              <span className="text-sm text-muted-foreground ml-1">min</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
