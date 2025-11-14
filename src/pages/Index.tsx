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
    </div>
  );
};

export default Index;
