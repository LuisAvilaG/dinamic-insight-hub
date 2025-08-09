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
    <header className="stripe-card border-b border-border bg-white/95 backdrop-blur-sm h-16">
      <div className="flex items-center justify-between h-full px-6">
        {/* Logo and brand */}
        <div className="flex items-center space-x-4">
          <SidebarTrigger className="text-foreground hover:bg-muted" />
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/9b828b6e-2c36-4919-b6e0-7ef42a97c137.png" 
              alt="Dinamic Software" 
              className="w-8 h-8 object-contain"
            />
            <span className="stripe-logo-text text-xl font-bold hidden sm:block">
              Dinamic Software
            </span>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex-1 max-w-xl mx-6">
          <SearchBar />
        </div>

        {/* User menu */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Bell className="h-5 w-5" />
            {notifications > 0 && (
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs stripe-icon text-white">
                {notifications}
              </Badge>
            )}
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Settings className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-muted">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Usuario" />
                  <AvatarFallback className="stripe-icon text-white text-sm">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 stripe-card" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">Usuario</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    usuario@dinamicsoftware.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-foreground hover:bg-muted">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-muted">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-foreground hover:bg-muted">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};