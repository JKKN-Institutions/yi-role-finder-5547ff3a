import { Hero } from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        {isAdmin ? (
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="bg-background/80 backdrop-blur-sm"
          >
            Admin Dashboard
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/login")}
            className="bg-background/80 backdrop-blur-sm"
          >
            <Lock className="w-4 h-4 mr-2" />
            Admin Login
          </Button>
        )}
      </div>

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
