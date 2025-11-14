import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";

interface Recommendation {
  role: string;
  confidence: number;
  reason: string;
}

interface RoleRecommendationsProps {
  recommendations: Recommendation[];
}

export const RoleRecommendations = ({ recommendations }: RoleRecommendationsProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const getRankBadge = (index: number) => {
    const badges = ['🥇 Best Fit', '🥈 Great Match', '🥉 Good Option'];
    return badges[index] || '✨ Alternative';
  };

  const getRankColor = (index: number) => {
    if (index === 0) return 'border-yi-orange bg-yi-orange/10';
    if (index === 1) return 'border-accent bg-accent/10';
    return 'border-border bg-card';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-yi-orange/20 flex items-center justify-center">
          <Award className="w-6 h-6 text-yi-orange" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Your Perfect Roles</h2>
          <p className="text-sm text-muted-foreground">AI-matched based on your profile</p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card 
              className={`p-6 border-2 ${getRankColor(index)} transition-all cursor-pointer hover:shadow-lg`}
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant={index === 0 ? "default" : "outline"}
                        className={index === 0 ? "bg-yi-orange" : ""}
                      >
                        {getRankBadge(index)}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-1">{rec.role}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Progress value={rec.confidence} className="h-2 flex-1 max-w-[200px]" />
                      <span className="text-sm font-semibold text-accent">{rec.confidence}% Match</span>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-5 h-5 transition-transform ${expandedIndex === index ? 'rotate-90' : ''}`} 
                  />
                </div>

                {/* Why Section */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-yi-orange mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold mb-1">Why this role fits you:</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Expanded CTA */}
                {expandedIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-border"
                  >
                    <Button 
                      className={index === 0 ? "w-full bg-yi-orange hover:bg-yi-orange/90" : "w-full"}
                      size="lg"
                    >
                      Apply for {rec.role}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
