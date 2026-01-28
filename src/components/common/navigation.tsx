import { useState } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "../ui/sheet";
import {
  Home,
  User,
  Trophy,
  Calendar,
  Users,
  Target,
  Calculator,
  BarChart3,
  Megaphone,
  Bell,
  History,
  Settings,
  Shield,
  UserPlus,
  ClipboardList,
  Gift,
  BarChart,
  Clock,
  FileText,
  X,
  LayoutDashboard,
  CreditCard,
  Zap,
  Package,
  LogOut,
  LogIn
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  onShowLogin?: () => void;
  isAJUser?: boolean;
  onLogoClick?: () => void;
}

export function Navigation({
  currentView,
  onViewChange,
  isAdmin,
  onToggleAdmin,
  isMobileMenuOpen,
  onMobileMenuClose,
  onShowLogin,
  isAJUser = false,
  onLogoClick
}: NavigationProps) {
  const { isAuthenticated, logout, user } = useAuth();
  const memberPages = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "Profile", icon: User },
    { id: "my-card", label: "My Card", icon: CreditCard },
    { id: "rewards", label: "Rewards Store", icon: Gift },
    { id: "classes", label: "Classes & Booking", icon: Calendar },
    { id: "membership", label: "Membership Plans", icon: CreditCard },
    { id: "challenges", label: "Challenges", icon: Target },
    { id: "calculators", label: "Health Tools", icon: Calculator },
  ];

  const adminPages = [
    { id: "admin-dashboard", label: "Admin Dashboard", icon: BarChart },
    { id: "user-management", label: "User Management", icon: UserPlus },
    { id: "inventory-management", label: "Inventory", icon: Package },
    { id: "content-management", label: "Content Management", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "access-logs", label: "Access Logging", icon: Clock },
  ];

  const pages = isAdmin ? adminPages : memberPages;

  const handleViewChange = (view: string) => {
    onViewChange(view);
    if (onMobileMenuClose) {
      onMobileMenuClose();
    }
  };

  const handleLogout = () => {
    logout();
    if (onShowLogin) {
      onShowLogin();
    }
  };

  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    } else {
      handleViewChange("dashboard");
    }
  };

  const NavigationContent = () => (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-start animate-fadeInDown">
        <img
          src="/images/logo.png"
          alt="P&L Fitness"
          className="h-14 w-auto transition-transform-smooth hover:scale-105 cursor-pointer"
          onClick={handleLogoClick}
        />
      </div>

      {/* Only show admin toggle for AJ user */}
      {isAJUser && (
        <div className="flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs transition-smooth">
              {isAdmin ? "ADMIN" : "MEMBER"}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleAdmin}
            className="text-xs btn-hover-scale"
          >
            Switch to {isAdmin ? "Member" : "Admin"}
          </Button>
        </div>
      )}

      <nav className="space-y-1 flex-1">
        {pages.map((page, index) => {
          const Icon = page.icon;
          return (
            <Button
              key={page.id}
              variant={currentView === page.id ? "secondary" : "ghost"}
              className={`w-full justify-start transition-smooth animate-slideInLeft stagger-${index + 1} ${
                currentView === page.id
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted"
              }`}
              onClick={() => handleViewChange(page.id)}
            >
              <Icon className="mr-2 h-4 w-4 transition-transform-smooth group-hover:scale-110" />
              {page.label}
            </Button>
          );
        })}
      </nav>

      {/* Login/Logout Button at Bottom */}
      <div className="pt-4 border-t border-border animate-fadeInUp">
        {isAuthenticated ? (
          <Button
            variant="outline"
            className="w-full justify-start border-2 hover:bg-destructive hover:text-destructive-foreground btn-hover-scale transition-smooth"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log Out
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full justify-start bg-[#003366] hover:bg-[#005599] btn-hover-scale transition-smooth"
            onClick={onShowLogin}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Log In
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-card border-r border-border h-screen sticky top-0 overflow-y-auto app-sidebar">
        <NavigationContent />
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isMobileMenuOpen} onOpenChange={onMobileMenuClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
            <SheetDescription>
              {isAdmin ? "Admin navigation menu" : "Member navigation menu"}
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onMobileMenuClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <NavigationContent />
        </SheetContent>
      </Sheet>
    </>
  );
}