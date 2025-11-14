import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import yiLogo from "@/assets/yi-logo.png";

export default function Setup() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-admin-exists');
      
      if (error) throw error;

      if (data?.adminExists) {
        // Admin already exists, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      toast.error('Failed to check setup status');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('setup-first-admin', {
        body: {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Admin account created! You can now log in.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Setup error:', error);
      toast.error(error.message || 'Failed to create admin account');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking setup status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-xl">
          <div className="text-center mb-8">
            <img src={yiLogo} alt="Yi Logo" className="h-16 mx-auto mb-4" />
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">First-Time Setup</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Create your administrator account to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Full Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Confirm Password</label>
              <Input
                type="password"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <p>
                  This account will have full administrative access to the Yi Erode EC 2026 assessment system.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Admin Account...
                </>
              ) : (
                'Create Admin Account'
              )}
            </Button>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
