import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
  const [fullName, setFullName] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { email, fullName });
    
    // Trim and validate
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    
    if (!trimmedName) {
      toast.error("Please enter your full name");
      return;
    }
    
    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }
    
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsStarting(true);
    try {
      console.log('Calling startAssessment...');
      await startAssessment(trimmedEmail, trimmedName);
      toast.success("Assessment started!");
    } catch (error) {
      console.error("Error in handleStart:", error);
      // Error toast is already shown in startAssessment
    } finally {
      setIsStarting(false);
    }
  };

  // Show assessment flow if already started
  if (assessment) {
    return <AssessmentFlow />;
  }

  // Show email input screen
  return <div className="min-h-screen bg-gradient-hero animate-gradient-shift bg-[length:200%_200%] flex items-center justify-center p-3 sm:p-4">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-48 sm:w-72 h-48 sm:h-72 bg-yi-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-64 sm:w-96 h-64 sm:h-96 bg-yi-cyan/10 rounded-full blur-3xl animate-float" style={{
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
        <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-5 sm:p-8 shadow-card backdrop-blur-sm">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <img src={yiLogo} alt="Yi Erode Logo" className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 animate-float drop-shadow-glow" />
            <h1 className="text-xl sm:text-2xl font-bold text-center mb-2">
              Yi Erode EC 2026
            </h1>
            <p className="text-muted-foreground text-center text-xs sm:text-sm">
              Intelligent Role Matching Assessment
            </p>
          </div>

          <form onSubmit={handleStart} className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm sm:text-base">Your Full Name</Label>
              <Input 
                id="fullName" 
                name="name"
                type="text" 
                placeholder="John Doe" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
                autoComplete="name"
                required 
                className="text-base h-12 sm:h-auto" 
                disabled={isStarting} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Your Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="your.email@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                autoComplete="email"
                required 
                className="text-base h-12 sm:h-auto" 
                disabled={isStarting} 
              />
              <p className="text-xs text-muted-foreground">
                We&apos;ll use this to save your progress and send you results
              </p>
            </div>

            <Button type="submit" disabled={isStarting} className="w-full bg-yi-orange hover:bg-yi-orange/90 text-primary-foreground font-semibold h-14 sm:h-auto sm:py-6 text-base sm:text-lg" size="lg">
              {isStarting ? "Starting..." : "Start Assessment"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block py-2"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>;
};
export default Assessment;