import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight } from "lucide-react";
import yiLogo from "@/assets/yi-logo.png";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero animate-gradient-shift bg-[length:200%_200%]">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-yi-orange/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yi-cyan/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="container relative z-10 px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto"
        >
          {/* Logo and Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center space-y-4"
          >
            <img 
              src={yiLogo} 
              alt="Yi Erode Logo" 
              className="w-20 h-20 md:w-24 md:h-24 animate-float drop-shadow-glow"
            />
            <Badge variant="outline" className="border-accent/50 bg-accent/10 text-accent px-4 py-1.5">
              <Sparkles className="w-3 h-3 mr-2" />
              Powered by AI
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            Find Your Perfect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yi-orange via-yi-glow to-yi-cyan">
              Yi Role
            </span>
            <br />
            in 3 Minutes
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl"
          >
            AI-powered matching system. Answer 5 questions. Get your ideal EC position.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Button 
              size="lg" 
              className="bg-yi-orange hover:bg-yi-orange/90 text-primary-foreground px-8 py-6 text-lg font-semibold shadow-glow hover:shadow-xl transition-all duration-300 group animate-pulse-glow"
            >
              Start Smart Assessment
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>

          {/* Stats Ticker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm md:text-base text-muted-foreground pt-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yi-cyan rounded-full animate-pulse" />
              <span className="font-semibold text-foreground">2,422</span> members
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yi-orange rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
              <span className="font-semibold text-foreground">9</span> verticals
            </div>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yi-cyan rounded-full animate-pulse" style={{ animationDelay: "0.6s" }} />
              <span className="font-semibold text-foreground">60+</span> positions
            </div>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col md:flex-row items-center gap-4 md:gap-6 pt-8"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
              <div className="w-2 h-2 bg-yi-orange rounded-full" />
              <span className="text-sm text-muted-foreground">Based on 4 years of Yi Erode data</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card/50 backdrop-blur-sm border border-border">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span className="text-sm text-muted-foreground">
                <span className="font-semibold text-accent">95%</span> accuracy
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};
