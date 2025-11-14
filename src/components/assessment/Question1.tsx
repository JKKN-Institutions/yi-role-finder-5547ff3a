import { useState } from "react";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { VERTICALS, VERTICAL_DESCRIPTIONS } from "@/types/assessment";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface Question1Props {
  onAnswer: (data: any) => void;
  initialValue?: string[];
}

export const Question1 = ({ onAnswer, initialValue = [] }: Question1Props) => {
  const [selectedVerticals, setSelectedVerticals] = useState<string[]>(initialValue);
  const [showDescriptions, setShowDescriptions] = useState(false);

  const handleToggle = (vertical: string) => {
    setSelectedVerticals(prev => {
      if (prev.includes(vertical)) {
        return prev.filter(v => v !== vertical);
      } else if (prev.length < 3) {
        return [...prev, vertical];
      }
      return prev;
    });
  };

  const handleSubmit = () => {
    if (selectedVerticals.length > 0) {
      onAnswer(selectedVerticals);
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
          Which Yi verticals excite you most?
        </h2>
        <p className="text-muted-foreground">Select up to 3</p>
      </div>

      <div className="grid gap-3">
        {VERTICALS.map((vertical) => (
          <label
            key={vertical}
            className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedVerticals.includes(vertical)
                ? "border-yi-orange bg-yi-orange/10"
                : "border-border hover:border-yi-orange/50"
            }`}
          >
            <Checkbox
              checked={selectedVerticals.includes(vertical)}
              onCheckedChange={() => handleToggle(vertical)}
              disabled={!selectedVerticals.includes(vertical) && selectedVerticals.length >= 3}
            />
            <span className="font-medium flex-1">{vertical}</span>
          </label>
        ))}
      </div>

      <Collapsible open={showDescriptions} onOpenChange={setShowDescriptions}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full">
            {showDescriptions ? (
              <>
                Hide descriptions <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Show me what each vertical does <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {VERTICALS.map((vertical) => (
            <div key={vertical} className="p-3 rounded-lg bg-card">
              <p className="font-semibold text-sm">{vertical}</p>
              <p className="text-sm text-muted-foreground">
                {VERTICAL_DESCRIPTIONS[vertical]}
              </p>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Button
        onClick={handleSubmit}
        disabled={selectedVerticals.length === 0}
        className="w-full bg-yi-orange hover:bg-yi-orange/90"
        size="lg"
      >
        Next Question
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Selected {selectedVerticals.length} of 3
      </p>
    </motion.div>
  );
};