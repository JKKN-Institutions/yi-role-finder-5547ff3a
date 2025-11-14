import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ValidationMetrics() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('validation_metrics')
        .select('*')
        .order('metric_date', { ascending: true })
        .limit(30);

      if (error) throw error;

      setMetrics(data || []);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-feedback');

      if (error) throw error;

      setInsights(data);
      toast({
        title: 'Analysis Complete',
        description: `Analyzed ${data.feedback_count} feedback entries`,
      });
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: 'Error',
        description: 'Failed to run AI analysis',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const latestMetrics = metrics.length > 0 ? metrics[metrics.length - 1] : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recommendation Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.recommendation_accuracy_percent || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              AI predictions matching leadership decisions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Override Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.override_rate_percent || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Leadership overriding AI recommendations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.avg_six_month_rating?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              6-month performance rating (1-5)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestMetrics?.retention_rate_percent || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Still active after 6 months
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Accuracy Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Accuracy Trend Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="metric_date" 
                stroke="hsl(var(--foreground))"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="recommendation_accuracy_percent" 
                stroke="#22c55e" 
                strokeWidth={2}
                name="Accuracy %"
              />
              <Line 
                type="monotone" 
                dataKey="override_rate_percent" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Override %"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>AI-Powered Improvement Insights</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Analyze feedback data to discover patterns and improvement opportunities
            </p>
          </div>
          <Button onClick={runAIAnalysis} disabled={isAnalyzing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
          </Button>
        </CardHeader>
        <CardContent>
          {!insights ? (
            <div className="text-center py-8 text-muted-foreground">
              Click "Run AI Analysis" to generate insights from feedback data
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Metrics */}
              {insights.metrics && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Current Status</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Feedback:</span>
                      <span className="font-bold ml-2">{insights.metrics.total_feedback}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Accuracy:</span>
                      <span className="font-bold ml-2">{insights.metrics.accuracy_rate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Override Rate:</span>
                      <span className="font-bold ml-2">{insights.metrics.override_rate}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {insights.insights && (
                <div className="space-y-4">
                  {insights.insights.recommended_actions && (
                    <div>
                      <h4 className="font-semibold mb-2">Recommended Actions</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {insights.insights.recommended_actions.map((action: string, i: number) => (
                          <li key={i} className="text-muted-foreground">{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {insights.insights.raw_analysis && (
                    <div>
                      <h4 className="font-semibold mb-2">Detailed Analysis</h4>
                      <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
                        {insights.insights.raw_analysis}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
