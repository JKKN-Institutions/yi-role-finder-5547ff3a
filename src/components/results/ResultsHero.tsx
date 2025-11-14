import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { QuadrantChart } from "./QuadrantChart";
import { Target, TrendingUp } from "lucide-react";

interface ResultsHeroProps {
  willScore: number;
  skillScore: number;
  quadrant: string;
  commitmentLevel: string;
  skillReadiness: string;
}

export const ResultsHero = ({ 
  willScore, 
  skillScore, 
  quadrant,
  commitmentLevel,
  skillReadiness 
}: ResultsHeroProps) => {
  const getQuadrantIcon = () => {
    if (quadrant.includes('STAR')) return '⭐';
    if (quadrant.includes('WILLING')) return '🚀';
    if (quadrant.includes('RELUCTANT')) return '🤔';
    return '🌱';
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* Will-Skill Plot */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card border-2 border-border rounded-2xl p-8"
      >
        <h3 className="font-bold text-xl mb-6 text-center">Your Position on the Will-Skill Matrix</h3>
        <QuadrantChart 
          willScore={willScore} 
          skillScore={skillScore} 
          quadrant={quadrant} 
        />
      </motion.div>

      {/* Scores Panel */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-yi-orange/10 via-card to-accent/10 border-2 border-yi-orange/30 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-yi-orange/20 flex items-center justify-center text-2xl">
              {getQuadrantIcon()}
            </div>
            <div>
              <h3 className="font-bold text-2xl">{quadrant}</h3>
              <p className="text-sm text-muted-foreground">Your Profile Classification</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-2 border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yi-orange/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-yi-orange" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold">WILL Score</h4>
                <Badge className="bg-yi-orange">{commitmentLevel.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Commitment & Drive</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <motion.span 
                className="text-4xl font-bold text-yi-orange"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
                {willScore}%
              </motion.span>
            </div>
            <Progress value={willScore} className="h-4 bg-muted" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border-2 border-border rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold">SKILL Score</h4>
                <Badge variant="outline">{skillReadiness.toUpperCase()}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Expertise & Readiness</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-baseline">
              <motion.span 
                className="text-4xl font-bold text-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                {skillScore}%
              </motion.span>
            </div>
            <Progress value={skillScore} className="h-4 bg-muted" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
