import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

export function AnalyticsView() {
  const [quadrantData, setQuadrantData] = useState<any[]>([]);
  const [verticalData, setVerticalData] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select('quadrant, vertical_matches, will_score, skill_score');

      if (error) throw error;

      // Process quadrant distribution
      const quadrantCounts: Record<string, number> = {};
      results?.forEach(r => {
        const q = r.quadrant || 'Unknown';
        quadrantCounts[q] = (quadrantCounts[q] || 0) + 1;
      });

      const quadrants = Object.entries(quadrantCounts).map(([name, value]) => ({
        name: name.replace('Q1 - STAR', 'Q1 Stars')
          .replace('Q2 - WILLING', 'Q2 Willing')
          .replace('Q3 - NOT READY', 'Q3 Not Ready')
          .replace('Q4 - RELUCTANT', 'Q4 Reluctant'),
        value,
      }));
      setQuadrantData(quadrants);

      // Process vertical popularity
      const verticalCounts: Record<string, number> = {};
      results?.forEach(r => {
        const verticals = r.vertical_matches || [];
        verticals.forEach(v => {
          verticalCounts[v] = (verticalCounts[v] || 0) + 1;
        });
      });

      const verticals = Object.entries(verticalCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 9);
      setVerticalData(verticals);

      // Process score distribution
      const scores = results?.map(r => ({
        will: r.will_score || 0,
        skill: r.skill_score || 0,
      })) || [];
      setScoreDistribution(scores);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#eab308', '#22c55e', '#f97316', '#3b82f6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Quadrant Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Quadrant Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={quadrantData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {quadrantData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Vertical Popularity */}
      <Card>
        <CardHeader>
          <CardTitle>Vertical Popularity</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={verticalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Distribution */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>WILL vs SKILL Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="skill" label={{ value: 'SKILL Score', position: 'insideBottom', offset: -5 }} stroke="hsl(var(--foreground))" />
              <YAxis label={{ value: 'WILL Score', angle: -90, position: 'insideLeft' }} stroke="hsl(var(--foreground))" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="will" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} name="WILL Score" />
              <Line type="monotone" dataKey="skill" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="SKILL Score" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
