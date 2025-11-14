import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Hero />
      
      {/* Override the CTA button in Hero to navigate to assessment */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-50">
        <Button
          size="lg"
          onClick={() => navigate("/assessment")}
          className="bg-yi-orange hover:bg-yi-orange/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-glow hover:shadow-xl transition-all duration-300 group animate-pulse-glow"
        >
          Start Smart Assessment
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
