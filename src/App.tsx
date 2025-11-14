import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AssessmentProvider } from "@/contexts/AssessmentContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import AdminDashboard from "./pages/AdminDashboard";
import { CandidateDetail } from "@/components/admin/CandidateDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AssessmentProvider>
            <Routes>
              <Route path="/" element={<Assessment />} />
              <Route path="/results" element={<Results />} />
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Setup />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/candidate/:assessmentId" 
                element={
                  <ProtectedRoute requireAdmin>
                    <CandidateDetail />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AssessmentProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
