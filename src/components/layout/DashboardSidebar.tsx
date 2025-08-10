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
  Home,
  FileText
} from "lucide-react";
import dinamicLogo from "@/assets/dinamic-logo.png";

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
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
    description: "Gestión de reportes"
  }
];

export const DashboardSidebar = ({ userRole }: { userRole?: string }) => {
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

  const items = [...navigationItems];
  if (userRole === "Admin") {
    items.push({ title: "Usuarios", url: "/admin/usuarios", icon: Users, description: "Gestión de usuarios" });
  }

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-white text-foreground shadow-sm`}>
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-8 flex items-center justify-center flex-shrink-0">
            <img 
              src={dinamicLogo} 
              alt="Dinamic Software" 
              className="w-full h-full object-contain"
            />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-xl font-bold text-foreground">Dinamic Software</h2>
              <p className="text-xs text-muted-foreground">Business Intelligence</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`${collapsed ? "sr-only" : ""} text-muted-foreground text-xs uppercase tracking-wider px-3 py-2 font-semibold`}>
            Navegación
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink
                      to={item.url}
                      className={({ isActive: navIsActive }) => {
                        const active = navIsActive || isActive(item.url);
                        return `
                          flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-200 group
                          ${active 
                            ? "bg-muted text-foreground border border-border" 
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          }
                        `;
                      }}
                    >
                      <item.icon className={`${collapsed ? "h-6 w-6" : "h-5 w-5"} flex-shrink-0`} />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs opacity-70 truncate">{item.description}</div>
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