import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import yiLogo from "@/assets/yi-logo-official.png";

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero animate-gradient-shift bg-[length:200%_200%] flex items-center justify-center p-3 sm:p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-yi-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-yi-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-card backdrop-blur-sm text-center">
          <div className="flex flex-col items-center mb-5 sm:mb-6">
            <img 
              src={yiLogo} 
              alt="Yi Erode Logo" 
              className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 animate-float drop-shadow-glow" 
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yi-orange/10 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-yi-orange" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Thank You!
          </h1>
          
          <p className="text-base sm:text-lg text-foreground mb-4 sm:mb-6">
            Your assessment has been submitted successfully.
          </p>

          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 px-2">
            The chapter leadership will get in touch with you for discussion.
          </p>

          <Button
            onClick={() => navigate("/")}
            className="w-full bg-yi-orange hover:bg-yi-orange/90 text-primary-foreground font-semibold h-14 sm:h-auto sm:py-6 text-base sm:text-lg"
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
