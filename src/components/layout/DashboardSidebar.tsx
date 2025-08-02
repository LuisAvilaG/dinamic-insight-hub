import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  BarChart3, 
  DollarSign, 
  Search, 
  Users, 
  Zap,
  Home
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
    description: "Vista general"
  },
  {
    title: "Operativo",
    url: "/operativo", 
    icon: BarChart3,
    description: "Reportes operacionales"
  },
  {
    title: "Financiero",
    url: "/financiero",
    icon: DollarSign,
    description: "Análisis financiero"
  },
  {
    title: "Consultoría", 
    url: "/consultoria",
    icon: Search,
    description: "Reportes de consultoría"
  },
  {
    title: "Directivo",
    url: "/directivo",
    icon: Users,
    description: "Dashboard ejecutivo"
  },
  {
    title: "Dinamic",
    url: "/dinamic",
    icon: Zap,
    description: "Herramientas Dinamic"
  }
];

export const DashboardSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/" || currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-dark text-dark-foreground`}>
      <SidebarHeader className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="text-white text-lg font-bold">DS</div>
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-white">Dinamic</h2>
              <p className="text-xs text-white/70">Business Intelligence</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-white/60 text-xs uppercase tracking-wider px-3 py-2`}>
            Departamentos
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-12">
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) => {
                        const active = navIsActive || isActive(item.url);
                        return `
                          flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200
                          ${active 
                            ? "bg-gradient-to-r from-primary/20 to-secondary/20 text-white border-l-4 border-primary" 
                            : "text-white/70 hover:text-white hover:bg-white/5"
                          }
                        `;
                      }}
                    >
                      <item.icon className={`${collapsed ? "h-6 w-6" : "h-5 w-5"} flex-shrink-0`} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-60 truncate">{item.description}</div>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};