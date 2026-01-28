import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import {
  Trophy,
  Calendar,
  LogOut,
  Menu,
  LayoutDashboard,
  Gift,
  Clock,
} from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-2">
              <img src="/images/logo.png" alt="P&L Fitness" className="h-12 w-auto md:h-16 lg:h-20" />
              <div className="hidden sm:block">
                <h1 className="text-lg md:text-xl font-bold">
                  <span className="text-primary"></span>{" "}
                  <span className="text-secondary"></span>
                </h1>
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary"></span> {" "}
                  <span className="text-secondary"></span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-secondary" />
              <Badge variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
                2,450 XP
              </Badge>
            </div>
            <Avatar className="h-8 w-8 md:h-9 md:w-9">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback className="bg-primary text-primary-foreground">JD</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}