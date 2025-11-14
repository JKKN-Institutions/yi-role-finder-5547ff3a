import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question1Props {
  onAnswer: (data: any) => void;
  initialValue?: { priority1?: string; priority2?: string; priority3?: string };
}

interface Vertical {
  id: string;
  name: string;
  description: string;
}

export const Question1 = ({ onAnswer, initialValue }: Question1Props) => {
  const [verticals, setVerticals] = useState<Vertical[]>([]);
  const [priority1, setPriority1] = useState<string>(initialValue?.priority1 || "");
  const [priority2, setPriority2] = useState<string>(initialValue?.priority2 || "");
  const [priority3, setPriority3] = useState<string>(initialValue?.priority3 || "");
  const [showDescriptions, setShowDescriptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchVerticals();
  }, []);

  const fetchVerticals = async () => {
    try {
      const { data, error } = await supabase
        .from("verticals")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setVerticals(data || []);
    } catch (error) {
      console.error("Error fetching verticals:", error);
      toast.error("Failed to load verticals");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableVerticals = (excludeIds: string[]) => {
    return verticals.filter(v => !excludeIds.includes(v.id));
  };

  const handleSubmit = () => {
    if (priority1) {
      onAnswer({ 
        priority1,
        priority2: priority2 || null,
        priority3: priority3 || null
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const selectedIds = [priority1, priority2, priority3].filter(Boolean);

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
        <p className="text-muted-foreground">Select your top 3 preferences in order of priority</p>
      </div>

      <div className="space-y-4">
        {/* Priority 1 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs">1</span>
            First Priority (Required)
          </label>
          <Select value={priority1} onValueChange={setPriority1}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your top choice" />
            </SelectTrigger>
            <SelectContent>
              {verticals.map((vertical) => (
                <SelectItem key={vertical.id} value={vertical.id}>
                  {vertical.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority 2 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs">2</span>
            Second Priority (Optional)
          </label>
          <Select value={priority2} onValueChange={setPriority2} disabled={!priority1}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your second choice" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableVerticals([priority1]).map((vertical) => (
                <SelectItem key={vertical.id} value={vertical.id}>
                  {vertical.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority 3 */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs">3</span>
            Third Priority (Optional)
          </label>
          <Select value={priority3} onValueChange={setPriority3} disabled={!priority2}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your third choice" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableVerticals([priority1, priority2]).map((vertical) => (
                <SelectItem key={vertical.id} value={vertical.id}>
                  {vertical.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Collapsible open={showDescriptions} onOpenChange={setShowDescriptions}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full">
            <ChevronDown className={`mr-2 h-4 w-4 transition-transform ${showDescriptions ? "rotate-180" : ""}`} />
            {showDescriptions ? "Hide" : "Show"} vertical descriptions
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 mt-4">
          {verticals.map((vertical) => (
            <div key={vertical.id} className="p-3 bg-muted/50 rounded-lg">
              <p className="font-semibold text-sm text-foreground">{vertical.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{vertical.description}</p>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>

      <Button
        onClick={handleSubmit}
        disabled={!priority1}
        className="w-full bg-yi-orange hover:bg-yi-orange/90"
        size="lg"
      >
        Next Question
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Selected {selectedIds.length} of 3
      </p>
    </motion.div>
  );
};
