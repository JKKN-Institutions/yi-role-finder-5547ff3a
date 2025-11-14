import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Question3Props {
  onAnswer: (data: any) => void;
  initialValue?: string;
}

export const Question3 = ({ onAnswer, initialValue = "" }: Question3Props) => {
  const [response, setResponse] = useState(initialValue);
  const maxChars = 150;

  const handleSubmit = () => {
    if (response.trim().length > 0) {
      onAnswer({ text: response.trim() });
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
          Complete this sentence:
        </h2>
        <p className="text-xl text-yi-orange font-semibold">
          &quot;If I&apos;m on EC 2026, by December I will have...&quot;
        </p>
      </div>

      <div className="space-y-2">
        <Textarea
          value={response}
          onChange={(e) => {
            if (e.target.value.length <= maxChars) {
              setResponse(e.target.value);
            }
          }}
          placeholder="...built, launched, trained, achieved..."
          className="min-h-[120px] resize-none"
          maxLength={maxChars}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Be specific and ambitious</span>
          <span>{response.length}/{maxChars}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <p className="font-semibold text-accent mb-1">✓ Strong example:</p>
          <p className="text-muted-foreground">
            &quot;...trained 50 volunteers and launched 3 road safety workshops reaching 500+ students&quot;
          </p>
        </div>
        <div className="p-3 bg-muted/50 border border-border rounded-lg">
          <p className="font-semibold text-muted-foreground mb-1">✗ Weak example:</p>
          <p className="text-muted-foreground">
            &quot;...hopefully done some good work and helped out&quot;
          </p>
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={response.trim().length === 0}
        className="w-full bg-yi-orange hover:bg-yi-orange/90"
        size="lg"
      >
        Next Question
      </Button>
    </motion.div>
  );
};