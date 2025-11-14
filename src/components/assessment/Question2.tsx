import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface Question2Props {
  onAnswer: (data: any) => void;
  initialValue?: string;
}

export const Question2 = ({ onAnswer, initialValue = "" }: Question2Props) => {
  const [response, setResponse] = useState(initialValue);
  const maxChars = 200;

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
          It&apos;s Saturday 6 PM. Your vertical needs urgent help for Sunday&apos;s event.
        </h2>
        <p className="text-muted-foreground">What&apos;s your response?</p>
      </div>

      <div className="space-y-2">
        <Textarea
          value={response}
          onChange={(e) => {
            if (e.target.value.length <= maxChars) {
              setResponse(e.target.value);
            }
          }}
          placeholder="Type your response here..."
          className="min-h-[150px] resize-none"
          maxLength={maxChars}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Be honest about your availability and commitment</span>
          <span>{response.length}/{maxChars}</span>
        </div>
      </div>

      <div className="space-y-2 p-4 bg-muted/50 rounded-lg text-sm">
        <p className="font-semibold text-foreground">Examples of strong responses:</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• "I&apos;m there - what needs to be done?"</li>
          <li>• "Count me in. Do we have budget and materials?"</li>
          <li>• "I can help but need to know the time commitment first"</li>
        </ul>
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