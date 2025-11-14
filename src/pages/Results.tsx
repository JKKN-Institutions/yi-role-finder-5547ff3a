import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Download, CheckCircle2, TrendingUp, Target } from "lucide-react";
import { useAssessment } from "@/contexts/AssessmentContext";
import { supabase } from "@/integrations/supabase/client";
import { AssessmentResult } from "@/types/assessment";
import { toast } from "sonner";
import yiLogo from "@/assets/yi-logo.png";

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
            key_insights: data.key_insights as AssessmentResult['key_insights']
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

  const handleShare = () => {
    const text = `I just completed the Yi Erode EC 2026 Assessment! My recommended role: ${result?.recommended_role}`;
    if (navigator.share) {
      navigator.share({ text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Results copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yi-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Analyzing your responses...</p>
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
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Button variant="ghost" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 bg-gradient-card border-yi-orange/30">
            <div className="flex items-start gap-6">
              <img src={yiLogo} alt="Yi Logo" className="w-16 h-16 animate-float" />
              <div className="flex-1">
                <Badge className="mb-3 bg-yi-orange">Your Best Fit Role</Badge>
                <h1 className="text-3xl md:text-4xl font-bold mb-3">
                  {result.recommended_role}
                </h1>
                <p className="text-muted-foreground text-lg">
                  {result.role_explanation}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Scores Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yi-orange/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-yi-orange" />
                </div>
                <div>
                  <h3 className="font-semibold">WILL Score</h3>
                  <p className="text-xs text-muted-foreground">Commitment & Drive</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{result.will_score}/100</span>
                  <span className="text-sm text-muted-foreground">
                    {result.key_insights.commitment_level.toUpperCase()}
                  </span>
                </div>
                <Progress value={result.will_score} className="h-3" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">SKILL Score</h3>
                  <p className="text-xs text-muted-foreground">Expertise & Readiness</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">{result.skill_score}/100</span>
                  <span className="text-sm text-muted-foreground">
                    {result.key_insights.skill_readiness.toUpperCase()}
                  </span>
                </div>
                <Progress value={result.skill_score} className="h-3" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Your Profile</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <h4 className="font-semibold">Key Strengths</h4>
                </div>
                <ul className="space-y-2">
                  {result.key_insights.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yi-orange mt-0.5">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-yi-orange" />
                  <h4 className="font-semibold">Growth Areas</h4>
                </div>
                <ul className="space-y-2">
                  {result.key_insights.development_areas.map((area, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-0.5">•</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Vertical Matches */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Best Fit Verticals</h3>
            <div className="flex flex-wrap gap-2">
              {result.vertical_matches.map((vertical, i) => (
                <Badge key={i} variant="outline" className="text-base py-2 px-4">
                  {vertical}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Leadership Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6 bg-accent/10 border-accent/30">
            <h3 className="font-semibold text-lg mb-2">Your Leadership Style</h3>
            <p className="text-muted-foreground">
              <span className="font-semibold text-accent">{result.leadership_style}</span> - 
              You naturally approach challenges with this mindset, making you well-suited for the {result.recommended_role} position.
            </p>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center pt-4"
        >
          <Button size="lg" className="bg-yi-orange hover:bg-yi-orange/90">
            Apply for EC 2026
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Results based on AI analysis of your responses
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;