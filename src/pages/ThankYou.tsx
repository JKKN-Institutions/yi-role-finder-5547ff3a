import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import yiLogo from "@/assets/yi-logo-official.png";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero animate-gradient-shift bg-[length:200%_200%] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-yi-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yi-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card backdrop-blur-sm text-center">
          <div className="flex flex-col items-center mb-6">
            <img 
              src={yiLogo} 
              alt="Yi Erode Logo" 
              className="w-16 h-16 mb-4 animate-float drop-shadow-glow" 
            />
            <div className="w-20 h-20 bg-yi-orange/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-12 h-12 text-yi-orange" />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">
            Thank You!
          </h1>
          
          <p className="text-lg text-foreground mb-6">
            Your assessment has been submitted successfully.
          </p>

          <p className="text-muted-foreground mb-8">
            The chapter leadership will get in touch with you for discussion.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-yi-orange hover:bg-yi-orange/90 text-primary-foreground font-semibold py-6"
            size="lg"
          >
            Return to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ThankYou;
