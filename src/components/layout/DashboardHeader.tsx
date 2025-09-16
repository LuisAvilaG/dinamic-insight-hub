
import React from "react";
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
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Settings, User, LogOut, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Notifications } from "./Notifications"; // IMPORTAMOS EL NUEVO COMPONENTE

export const PageHeader = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => {
  return (
    <div className="flex items-start space-x-4 p-1">
      <div className="flex-shrink-0 text-muted-foreground mt-1">
        {icon}
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// --- Helper Functions ---
const getInitials = (name: string) => {
  if (!name) return "";
  const names = name.split(' ');
  if (names.length > 1) return `${names[0][0]}${names[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const pageTitles: { [key: string]: string } = {
  "/dashboard": "Dashboard",
  "/operativo": "Operativo",
  "/financiero": "Financiero",
  "/consultoria": "Consultoría",
  "/directivo": "Directivo",
  "/dinamic": "Dinamic",
  "/reportes": "Reportes",
  "/perfil": "Mi Perfil",
  "/admin/usuarios": "Administración de Usuarios",
  "/recursos-humanos": "Recursos Humanos",
  "/admin/jerarquias": "Gestión de Jerarquías",
};

const getPageTitle = (pathname: string) => {
  for (const path in pageTitles) {
    if (pathname.startsWith(path)) return pageTitles[path];
  }
  return "Dashboard";
};

const UserMenuSkeleton = () => (
  <div className="flex items-center space-x-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="hidden md:flex flex-col space-y-1">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  </div>
);

// --- Main Component ---
export const DashboardHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, loading } = useAuth();

  const pageTitle = getPageTitle(location.pathname);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  const displayRole = profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : "";

  return (
    <header className="h-16 bg-background/80 backdrop-blur-sm border-b flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-2">
        <SidebarTrigger />
        <div>
          <h1 className="font-semibold text-lg hidden md:block">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground hidden md:block">Business Intelligence</p>
        </div>
      </div>

      <div className="flex-1 flex justify-center px-4 lg:px-8">
        <div className="w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar reportes, métricas, dashboards..." className="pl-9" />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Notifications /> {/* AÑADIMOS EL COMPONENTE DE NOTIFICACIONES */}
        <div className="border-l h-8 border-gray-300"></div>
        {loading ? (
          <UserMenuSkeleton />
        ) : user && profile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-3 text-left h-auto p-1 rounded-full">
                <Avatar className="h-9 w-9">
                  {profile.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.nombre} />}
                  <AvatarFallback className="font-bold">{getInitials(profile.nombre)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col space-y-0">
                  <p className="text-sm font-medium leading-none">{profile.nombre}</p>
                  <p className="text-xs leading-none text-muted-foreground">{displayRole}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>{profile.nombre}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/perfil')}><User className="mr-2 h-4 w-4" /><span>Perfil</span></DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/perfil')}><Settings className="mr-2 h-4 w-4" /><span>Configuración</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Cerrar Sesión</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
};
