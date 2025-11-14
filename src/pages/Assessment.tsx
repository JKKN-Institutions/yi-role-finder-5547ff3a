import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { useAssessment } from "@/contexts/AssessmentContext";
import { AssessmentFlow } from "@/components/assessment/AssessmentFlow";
import { toast } from "sonner";
import yiLogo from "@/assets/yi-logo-official.png";
const Assessment = () => {
  const navigate = useNavigate();
  const {
    assessment,
    startAssessment
  } = useAssessment();
  const [email, setEmail] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsStarting(true);
    try {
      await startAssessment(email);
      toast.success("Assessment started!");
    } catch (error) {
      console.error("Error starting assessment:", error);
      toast.error("Failed to start assessment");
    } finally {
      setIsStarting(false);
    }
  };

  // Show assessment flow if already started
  if (assessment) {
    return <AssessmentFlow />;
  }

  // Show email input screen
  return <div className="min-h-screen bg-gradient-hero animate-gradient-shift bg-[length:200%_200%] flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-yi-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yi-cyan/10 rounded-full blur-3xl animate-float" style={{
      animationDelay: "1s"
    }} />

      <motion.div initial={{
      opacity: 0,
      scale: 0.95
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5
    }} className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-card backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <img src={yiLogo} alt="Yi Erode Logo" className="w-16 h-16 mb-4 animate-float drop-shadow-glow" />
            <h1 className="text-2xl font-bold text-center mb-2">
              Yi Erode EC 2026
            </h1>
            <p className="text-muted-foreground text-center text-sm">
              Intelligent Role Matching Assessment
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Your Email Address</Label>
              <Input id="email" type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="text-base" disabled={isStarting} />
              <p className="text-xs text-muted-foreground">
                We&apos;ll use this to save your progress and send you results
              </p>
            </div>

            

            <Button type="submit" disabled={isStarting} className="w-full bg-yi-orange hover:bg-yi-orange/90 text-primary-foreground font-semibold py-6" size="lg">
              {isStarting ? "Starting..." : "Start Assessment"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <p className="text-xs text-center text-muted-foreground mt-6">
            Based on 4 years of Yi Erode data • 95% accuracy
          </p>
        </div>
      </motion.div>
    </div>;
};
export default Assessment;