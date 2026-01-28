import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "./components/ui/button";
import { Navigation } from "./components/common/navigation";
import { DashboardStats } from "./components/dashboard/dashboard-stats";
import { LandingPage } from "./components/auth/landing-page";
import { ProfilePage } from "./components/profile/profile-page";
import { RewardsStore } from "./components/rewards/rewards-store";
import { SchedulingSection } from "./components/fitness/scheduling-section";
import { Challenges } from "./components/fitness/challenges";
import { HealthTools } from "./components/fitness/health-tools";
import { AdminDashboard } from "./components/admin/admin-dashboard";
import { UserManagement } from "./components/admin/user-management";
import { ContentManagement } from "./components/admin/content-management";
import { Analytics } from "./components/dashboard/analytics";
import { MembershipPlans } from "./components/fitness/membership-plans";
import { MyCard } from "./components/profile/my-card";
import { AdminAccessLogging } from "./components/admin/admin-access-logging";
import { InventoryManagement } from "./components/admin/inventory-management";
import { LoginPage } from "./components/auth/login-page";
import { RegisterPage } from "./components/auth/register-page";
import { useAuth } from "./contexts/AuthContext";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authView, setAuthView] = useState<"login" | "register" | null>(null);
  const { isAuthenticated, user } = useAuth();

  // Check if current user is admin (by role)
  const isAdminUser = user?.role === 'ADMIN';

  // Reset admin mode when user changes and is not admin
  useEffect(() => {
    if (user && !isAdminUser && isAdmin) {
      setIsAdmin(false);
      setCurrentView("dashboard");
    }
  }, [user, isAdminUser]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleToggleAdmin = () => {
    // Only allow admin users to toggle admin mode
    if (user?.role === 'ADMIN') {
      setIsAdmin(!isAdmin);
      setCurrentView(isAdmin ? "dashboard" : "admin-dashboard");
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleShowLogin = () => {
    setAuthView("login");
    // Reset admin mode when showing login
    setIsAdmin(false);
  };

  const handleShowRegister = () => {
    setAuthView("register");
  };

  const handleLoginSuccess = () => {
    setAuthView(null);
    // Reset to member dashboard on login
    setIsAdmin(false);
    setCurrentView("dashboard");
  };

  const handleRegisterSuccess = () => {
    setAuthView("login");
  };

  const handleBackToDashboard = () => {
    setAuthView(null);
    // Reset to member dashboard and member mode
    setIsAdmin(false);
    setCurrentView("dashboard");
  };

  const handleLogoClick = () => {
    // Always go to member dashboard when clicking logo
    setIsAdmin(false);
    setCurrentView("dashboard");
  };

  // Removed admin route protection - no login required

  const renderContent = () => {
    // Admin-only views
    const adminViews = ["admin-dashboard", "user-management", "content-management", "analytics", "inventory-management", "access-logs"];

    // Check if trying to access admin view without admin role
    if (adminViews.includes(currentView) && !isAdminUser) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4 text-red-500">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
          <Button onClick={() => setCurrentView("dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      );
    }

    switch (currentView) {
      case "landing":
        return <LandingPage />;
      case "dashboard":
        return <DashboardStats />;
      case "profile":
        return <ProfilePage />;
      case "my-card":
        return <MyCard />;
      case "rewards":
        return <RewardsStore />;
      case "classes":
        return <SchedulingSection />;
      case "membership":
        return <MembershipPlans />;
      case "challenges":
        return <Challenges />;
      case "calculators":
        return <HealthTools />;
      case "access-logs":
        return <AdminAccessLogging />;

      // Admin views
      case "admin-dashboard":
        return <AdminDashboard />;
      case "user-management":
        return <UserManagement />;
      case "content-management":
        return <ContentManagement />;
      case "analytics":
        return <Analytics />;
      case "inventory-management":
        return <InventoryManagement />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
            <p className="text-muted-foreground">This feature is under development.</p>
          </div>
        );
    }
  };

  // Show login or register page if user is not authenticated
  if (authView === "login") {
    return (
      <LoginPage
        onSwitchToRegister={handleShowRegister}
        onLoginSuccess={handleLoginSuccess}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  if (authView === "register") {
    return (
      <RegisterPage
        onSwitchToLogin={handleShowLogin}
        onRegisterSuccess={handleRegisterSuccess}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Mobile menu toggle (visible on small screens since header removed) */}
        <div className="md:hidden p-2">
          <Button variant="ghost" size="icon" onClick={handleMobileMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <Navigation
          currentView={currentView}
          onViewChange={handleViewChange}
          isAdmin={isAdmin}
          onToggleAdmin={handleToggleAdmin}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={handleMobileMenuClose}
          onShowLogin={handleShowLogin}
          isAJUser={isAdminUser}
          onLogoClick={handleLogoClick}
        />

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto min-h-[calc(100vh-theme(spacing.16))]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}