import { useState } from "react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Question5Props {
  onAnswer: (data: any) => void;
  onSubmit: () => void;
  initialValue?: string;
}

const LEADERSHIP_STYLES = [
  {
    value: "doer",
    label: "A) Jump in and complete it yourself",
    description: "Doer - High SKILL, Moderate leadership",
    recommendation: "Volunteer/Co-Chair"
  },
  {
    value: "leader",
    label: "B) Call emergency meeting, redistribute tasks",
    description: "Leader - High leadership potential",
    recommendation: "Vertical Chair"
  },
  {
    value: "strategic",
    label: "C) Analyze why it happened, fix the process",
    description: "Strategic - Chair material",
    recommendation: "Co-Chair (future Chair)"
  },
  {
    value: "learning",
    label: "D) Ask for mentorship on how to handle it",
    description: "Learning - Co-Chair material",
    recommendation: "Volunteer (high potential)"
  },
];

export const Question5 = ({ onAnswer, onSubmit, initialValue }: Question5Props) => {
  const [selectedStyle, setSelectedStyle] = useState(initialValue || "");

  const handleSubmit = async () => {
    if (selectedStyle) {
      await onAnswer({ leadership_style: selectedStyle });
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Your team misses a deadline. You:
        </h2>
        <p className="text-muted-foreground">
          Choose the approach that feels most natural to you
        </p>
      </div>

      <RadioGroup value={selectedStyle} onValueChange={setSelectedStyle}>
        <div className="space-y-3">
          {LEADERSHIP_STYLES.map((style) => (
            <Label
              key={style.value}
              className={`flex flex-col space-y-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStyle === style.value
                  ? "border-yi-orange bg-yi-orange/10"
                  : "border-border hover:border-yi-orange/50"
              }`}
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value={style.value} className="mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{style.label}</p>
                  <p className="text-sm text-muted-foreground">{style.description}</p>
                  <p className="text-xs text-accent font-semibold">
                    → {style.recommendation}
                  </p>
                </div>
              </div>
            </Label>
          ))}
        </div>
      </RadioGroup>

      <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Final Question:</strong> Your answer here directly influences 
          your role recommendation. There&apos;s no &quot;right&quot; answer - we&apos;re matching your natural 
          leadership style to the best-fit position.
        </p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!selectedStyle}
        className="w-full bg-yi-orange hover:bg-yi-orange/90"
        size="lg"
      >
        Submit Assessment
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        This is the last question. Click submit to see your results!
      </p>
    </motion.div>
  );
};