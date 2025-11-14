import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Lightbulb, CheckCircle2, TrendingUp } from "lucide-react";

interface UniqueInsightsProps {
  strengths: string[];
  developmentAreas: string[];
}

export const UniqueInsights = ({ strengths, developmentAreas }: UniqueInsightsProps) => {
  return (
    <Card className="p-8 bg-gradient-to-br from-accent/5 via-card to-yi-orange/5 border-2 border-accent/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">What Makes You Unique</h2>
          <p className="text-sm text-muted-foreground">AI-discovered insights from your responses</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <h3 className="font-bold text-lg">Your Superpowers</h3>
          </div>
          <ul className="space-y-3">
            {strengths.map((strength, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20"
              >
                <span className="text-accent font-bold text-lg flex-shrink-0">•</span>
                <span className="text-sm leading-relaxed">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Development Areas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-yi-orange" />
            <h3 className="font-bold text-lg">Growth Opportunities</h3>
          </div>
          <ul className="space-y-3">
            {developmentAreas.map((area, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-yi-orange/10 border border-yi-orange/20"
              >
                <span className="text-yi-orange font-bold text-lg flex-shrink-0">→</span>
                <span className="text-sm leading-relaxed">{area}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </Card>
  );
};
