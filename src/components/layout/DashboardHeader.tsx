import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReportSearch } from "@/components/search/ReportSearch";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 shadow-sm relative z-10">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="md:hidden" />
        
        <div className="hidden md:flex items-center space-x-3">
          <div className="w-10 h-10 dinamic-icon flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent-purple"></div>
            <Zap className="w-5 h-5 text-white relative z-10" />
          </div>
          <div>
            <h1 className="text-lg font-bold dinamic-logo">DINAMIC</h1>
            <div className="text-xs text-primary font-semibold">SOFTWARE</div>
          </div>
        </div>
      </div>

      {/* Center section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <ReportSearch />
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-3">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-smooth">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-secondary to-primary border-0"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-smooth" onClick={() => navigate('/perfil')}>
          <Settings className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
                <AvatarFallback className="dinamic-icon text-white font-bold">
                  DS
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Usuario Admin</p>
                <p className="text-xs leading-none text-muted-foreground">
                  admin@dinamicsoftware.com
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem className="hover:bg-primary/10 transition-smooth" onClick={() => navigate('/perfil')}>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="hover:bg-primary/10 transition-smooth" onClick={() => navigate('/perfil')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={onLogout}
              className="text-destructive focus:text-destructive hover:bg-destructive/10 transition-smooth"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};