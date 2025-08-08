import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { SearchBar } from "@/components/search/SearchBar";
import { 
  Bell, 
  Settings, 
  User, 
  LogOut
} from "lucide-react";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const [notifications] = useState(3); // Mock notification count

  return (
    <header className="h-20 glass-effect border-b border-white/20 flex items-center justify-between px-6 shadow-soft relative z-10">
      {/* Left section - Logo */}
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="md:hidden btn-glass" />
        
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <img 
              src="/lovable-uploads/9b828b6e-2c36-4919-b6e0-7ef42a97c137.png" 
              alt="Dinamic Software" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="border-l border-white/20 pl-4">
            <h1 className="text-xl font-black dinamic-logo-modern">DINAMIC</h1>
            <div className="text-xs font-bold text-primary tracking-widest">SOFTWARE</div>
          </div>
        </div>
      </div>

      {/* Center section - Modern Search */}
      <div className="flex-1 max-w-xl mx-6">
        <SearchBar />
      </div>

      {/* Right section - Modern Actions */}
      <div className="flex items-center space-x-2">
        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative glass-effect hover:bg-white/30 transition-smooth rounded-xl h-11 w-11"
        >
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-gradient-dinamic border-0 shadow-brand"
            >
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Settings */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="glass-effect hover:bg-white/30 transition-smooth rounded-xl h-11 w-11"
        >
          <Settings className="h-5 w-5" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-11 w-11 rounded-xl glass-effect hover:bg-white/30 transition-smooth">
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder-avatar.jpg" alt="Usuario" />
                <AvatarFallback className="dinamic-icon-modern text-white font-bold text-sm">
                  DS
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64 mt-2 bg-white/95 backdrop-blur-md border-white/20 shadow-large rounded-2xl" align="end" forceMount>
            <DropdownMenuLabel className="font-normal p-4">
              <div className="flex flex-col space-y-2">
                <p className="text-base font-semibold leading-none">Usuario Admin</p>
                <p className="text-sm leading-none text-muted-foreground">
                  admin@dinamicsoftware.com
                </p>
              </div>
            </DropdownMenuLabel>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            <DropdownMenuItem className="hover:bg-accent/50 transition-smooth m-1 rounded-xl p-3">
              <User className="mr-3 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="hover:bg-accent/50 transition-smooth m-1 rounded-xl p-3">
              <Settings className="mr-3 h-4 w-4" />
              <span>Configuración</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border/50" />
            
            <DropdownMenuItem 
              onClick={onLogout}
              className="text-destructive focus:text-destructive hover:bg-destructive/10 transition-smooth m-1 rounded-xl p-3"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};