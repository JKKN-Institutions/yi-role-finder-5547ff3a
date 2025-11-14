import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, TrendingUp, Users, BookOpen } from "lucide-react";

interface GrowthPathProps {
  quadrant: string;
  willScore: number;
  skillScore: number;
  growthPotential: string;
}

export const GrowthPath = ({ quadrant, willScore, skillScore, growthPotential }: GrowthPathProps) => {
  const getGrowthRecommendations = () => {
    if (quadrant.includes('STAR')) {
      return {
        title: "You're Ready to Lead!",
        description: "Your exceptional WILL and SKILL combination makes you ideal for senior roles.",
        suggestions: [
          { icon: Rocket, text: "Take on Chair or Co-Chair positions immediately" },
          { icon: Users, text: "Mentor new volunteers to multiply your impact" },
          { icon: BookOpen, text: "Share your expertise through training sessions" }
        ],
        timeline: "Start leading in 2026 → Scale impact in 2027"
      };
    }
    
    if (quadrant.includes('WILLING')) {
      return {
        title: "Build Your Skills, Keep That Fire!",
        description: `Your WILL is exceptional (${willScore}%), but building more execution experience would make you unstoppable.`,
        suggestions: [
          { icon: TrendingUp, text: "Join as Co-Chair to learn from experienced leaders" },
          { icon: BookOpen, text: "Attend Yi training workshops and seminars" },
          { icon: Users, text: "Shadow a current Chair for 3-6 months" }
        ],
        timeline: "Co-Chair in 2026 → Chair in 2027"
      };
    }
    
    if (quadrant.includes('RELUCTANT')) {
      return {
        title: "Re-ignite Your Passion",
        description: `You have the skills (${skillScore}%), but something's holding back your commitment.`,
        suggestions: [
          { icon: Users, text: "Connect with passionate members to find inspiration" },
          { icon: BookOpen, text: "Explore different verticals that might excite you more" },
          { icon: Rocket, text: "Start with a specific project rather than ongoing role" }
        ],
        timeline: "Project Lead in 2026 → Ongoing role when ready"
      };
    }
    
    return {
      title: "Start Your Journey Here",
      description: "Everyone starts somewhere! Focus on building both commitment and skills.",
      suggestions: [
        { icon: BookOpen, text: "Attend orientation sessions to understand Yi better" },
        { icon: Users, text: "Join as active volunteer to gain experience" },
        { icon: TrendingUp, text: "Observe different verticals to find your passion" }
      ],
      timeline: "Active Volunteer in 2026 → Co-Chair in 2027 → Chair in 2028"
    };
  };

  const growth = getGrowthRecommendations();

  return (
    <Card className="p-8 bg-gradient-to-br from-primary/5 via-card to-accent/5 border-2 border-primary/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
          <Rocket className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{growth.title}</h2>
          <p className="text-sm text-muted-foreground">{growth.description}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {growth.suggestions.map((suggestion, i) => {
          const Icon = suggestion.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm pt-2">{suggestion.text}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">Your Growth Timeline</span>
        </div>
        <p className="text-sm text-muted-foreground">{growth.timeline}</p>
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          Growth Potential: <Badge className="ml-2">{growthPotential}</Badge>
        </p>
      </div>
    </Card>
  );
};
