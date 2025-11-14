import { useState } from "react";
import { motion } from "framer-motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Question4Props {
  onAnswer: (data: any) => void;
  initialValue?: { constraint: string; handling?: string };
}

const CONSTRAINTS = [
  { value: "none", label: "None - I'm all in", points: 20 },
  { value: "time", label: "Time (work/family) - but I'll manage", points: 15 },
  { value: "expectations", label: "Need to understand expectations first", points: 10 },
  { value: "significant", label: "Significant constraints", points: 5 },
];

export const Question4 = ({ onAnswer, initialValue }: Question4Props) => {
  const [selectedConstraint, setSelectedConstraint] = useState(initialValue?.constraint || "");
  const [handlingText, setHandlingText] = useState(initialValue?.handling || "");
  const maxChars = 50;

  const handleSubmit = () => {
    if (selectedConstraint) {
      onAnswer({
        constraint: selectedConstraint,
        handling: handlingText.trim() || undefined,
      });
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
          Your biggest constraint for EC 2026?
        </h2>
        <p className="text-muted-foreground">Be honest - this helps us support you better</p>
      </div>

      <RadioGroup value={selectedConstraint} onValueChange={setSelectedConstraint}>
        <div className="space-y-3">
          {CONSTRAINTS.map((constraint) => (
            <Label
              key={constraint.value}
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedConstraint === constraint.value
                  ? "border-yi-orange bg-yi-orange/10"
                  : "border-border hover:border-yi-orange/50"
              }`}
            >
              <RadioGroupItem value={constraint.value} />
              <div className="flex-1">
                <span className="font-medium">{constraint.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                +{constraint.points} WILL
              </span>
            </Label>
          ))}
        </div>
      </RadioGroup>

      {selectedConstraint && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <Label htmlFor="handling">
            How will you handle it? <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="handling"
            value={handlingText}
            onChange={(e) => {
              if (e.target.value.length <= maxChars) {
                setHandlingText(e.target.value);
              }
            }}
            placeholder="Your strategy to manage this constraint..."
            maxLength={maxChars}
          />
          <p className="text-xs text-muted-foreground text-right">
            {handlingText.length}/{maxChars}
          </p>
        </motion.div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedConstraint}
        className="w-full bg-yi-orange hover:bg-yi-orange/90"
        size="lg"
      >
        Next Question
      </Button>
    </motion.div>
  );
};