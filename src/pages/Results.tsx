import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useAssessment } from "@/contexts/AssessmentContext";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentResult } from "@/types/assessment";
import { toast } from "sonner";
import yiLogo from "@/assets/yi-logo.png";
import { ResultsHero } from "@/components/results/ResultsHero";
import { RoleRecommendations } from "@/components/results/RoleRecommendations";
import { UniqueInsights } from "@/components/results/UniqueInsights";
import { GrowthPath } from "@/components/results/GrowthPath";
import { NextSteps } from "@/components/results/NextSteps";
import { ShareResults } from "@/components/results/ShareResults";
import { ConfettiEffect } from "@/components/results/ConfettiEffect";

const Results = () => {
  const navigate = useNavigate();
  const { assessment } = useAssessment();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!assessment) {
        navigate("/assessment");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("assessment_results")
          .select("*")
          .eq("assessment_id", assessment.id)
          .single();

        if (error) throw error;
        if (data) {
          setResult({
            ...data,
            key_insights: data.key_insights as AssessmentResult['key_insights'],
            recommendations: data.recommendations as AssessmentResult['recommendations']
          });
        }
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to load results");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [assessment, navigate]);

  const isStarQuadrant = result?.quadrant.includes('STAR') || false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yi-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your responses with AI...</p>
          <p className="text-xs text-muted-foreground mt-2">This takes about 2 seconds</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <p className="text-muted-foreground mb-4">No results found</p>
          <Button onClick={() => navigate("/assessment")}>Start Assessment</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 py-8 px-4">
      <ConfettiEffect trigger={isStarQuadrant} />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <Button variant="ghost" size="lg" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <img src={yiLogo} alt="Yi Logo" className="h-12 animate-float" />
        </motion.div>

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yi-orange via-accent to-primary bg-clip-text text-transparent">
            Your Yi Erode EC 2026 Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered analysis of your potential and perfect role match
          </p>
        </motion.div>

        {/* Section 1: Hero Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ResultsHero
            willScore={result.will_score}
            skillScore={result.skill_score}
            quadrant={result.quadrant}
            commitmentLevel={result.key_insights.commitment_level}
            skillReadiness={result.key_insights.skill_readiness}
          />
        </motion.div>

        {/* Section 2: Role Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RoleRecommendations recommendations={result.recommendations || []} />
        </motion.div>

        {/* Section 3: What Makes You Unique */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <UniqueInsights
            strengths={result.key_insights.strengths}
            developmentAreas={result.key_insights.development_areas}
          />
        </motion.div>

        {/* AI Reasoning */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 via-card to-yi-orange/5 border-2 border-primary/20">
            <h3 className="font-bold text-xl mb-4">🤖 AI Deep Dive Analysis</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {result.reasoning}
            </p>
          </Card>
        </motion.div>

        {/* Section 4: Growth Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GrowthPath
            quadrant={result.quadrant}
            willScore={result.will_score}
            skillScore={result.skill_score}
            growthPotential={result.key_insights.growth_potential}
          />
        </motion.div>

        {/* Section 5: Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <NextSteps />
        </motion.div>

        {/* Section 6: Share Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ShareResults
            quadrant={result.quadrant}
            recommendedRole={result.recommended_role}
          />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground">
            Results generated by AI based on your assessment responses • Yi Erode EC 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;