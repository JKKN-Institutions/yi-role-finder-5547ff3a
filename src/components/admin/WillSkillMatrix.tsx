import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';

interface CandidateData {
  id: string;
  name: string;
  will_score: number;
  skill_score: number;
  quadrant: string;
  assessment_id: string;
}

export function WillSkillMatrix() {
  const [data, setData] = useState<CandidateData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const { data: results, error } = await supabase
        .from('assessment_results')
        .select(`
          id,
          assessment_id,
          will_score,
          skill_score,
          quadrant,
          assessments (
            user_email
          )
        `);

      if (error) throw error;

      const formattedData = results?.map(r => ({
        id: r.id,
        name: (r.assessments as any)?.user_email || 'Anonymous',
        will_score: r.will_score || 0,
        skill_score: r.skill_score || 0,
        quadrant: r.quadrant || '',
        assessment_id: r.assessment_id,
      })) || [];

      setData(formattedData);
    } catch (error) {
      console.error('Error fetching candidate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getQuadrantColor = (quadrant: string) => {
    if (quadrant.includes('Q1')) return '#eab308'; // Yellow for Stars
    if (quadrant.includes('Q2')) return '#22c55e'; // Green for Willing
    if (quadrant.includes('Q3')) return '#f97316'; // Orange for Not Ready
    if (quadrant.includes('Q4')) return '#3b82f6'; // Blue for Reluctant
    return '#6b7280'; // Gray default
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">WILL: {data.will_score}%</p>
          <p className="text-sm text-muted-foreground">SKILL: {data.skill_score}%</p>
          <p className="text-sm font-medium mt-1">{data.quadrant}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        No candidate data available yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          type="number" 
          dataKey="skill_score" 
          name="SKILL" 
          domain={[0, 100]}
          label={{ value: 'SKILL Score (%)', position: 'insideBottom', offset: -10 }}
          stroke="hsl(var(--foreground))"
        />
        <YAxis 
          type="number" 
          dataKey="will_score" 
          name="WILL" 
          domain={[0, 100]}
          label={{ value: 'WILL Score (%)', angle: -90, position: 'insideLeft' }}
          stroke="hsl(var(--foreground))"
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Quadrant dividers */}
        <ReferenceLine x={70} stroke="hsl(var(--border))" strokeDasharray="5 5" />
        <ReferenceLine y={70} stroke="hsl(var(--border))" strokeDasharray="5 5" />
        
        <Scatter name="Candidates" data={data} fill="hsl(var(--primary))">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getQuadrantColor(entry.quadrant)} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  );
}
