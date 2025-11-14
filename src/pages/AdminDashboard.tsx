import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3, Users, FileText, TrendingUp, Target } from 'lucide-react';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { CandidateTable } from '@/components/admin/CandidateTable';
import { AnalyticsView } from '@/components/admin/AnalyticsView';
import { ValidationMetrics } from '@/components/admin/ValidationMetrics';
import { VerticalsManagement } from '@/components/admin/VerticalsManagement';
import { UserRoleManagement } from '@/components/admin/UserRoleManagement';
import { HireTracking } from '@/components/admin/HireTracking';

export default function AdminDashboard() {
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xl">Yi</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Yi Erode 2026 Assessment Review</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Admin Access</p>
            </div>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-5xl grid-cols-7">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="candidates">
              <Users className="w-4 h-4 mr-2" />
              Candidates
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <FileText className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="validation">
              <TrendingUp className="w-4 h-4 mr-2" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Target className="w-4 h-4 mr-2" />
              Hire Tracking
            </TabsTrigger>
            <TabsTrigger value="verticals">
              <FileText className="w-4 h-4 mr-2" />
              Verticals
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="candidates" className="space-y-6">
            <CandidateTable />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsView />
          </TabsContent>

          <TabsContent value="validation" className="space-y-6">
            <ValidationMetrics />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <HireTracking />
          </TabsContent>

          <TabsContent value="verticals" className="space-y-6">
            <VerticalsManagement />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserRoleManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
