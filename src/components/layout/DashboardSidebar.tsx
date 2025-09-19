
import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  BarChart3, DollarSign, Search, Users, Zap, Home, FileText, ShieldCheck, Settings, ChevronDown, LayoutDashboard, User, Calendar, Briefcase, Megaphone, GitBranch
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DinamicLogo from "@/assets/logorecortado.png"; // IMPORTAMOS EL LOGO

// --- ESTRUCTURA DE NAVEGACIÓN (Sin cambios) ---
// (El resto del código de configuración permanece igual)
const baseNavItems = [
  { id: 'dashboard', title: "Dashboard", url: "/dashboard", icon: Home, exact: true },
];

const recursosHumanosNavConfig = {
    id: 'recursos-humanos',
    title: 'Recursos Humanos',
    icon: Users,
    subItems: [
        { id: 'mis-permisos', title: 'Mis Permisos', url: '/recursos-humanos', icon: User, exact: true },
        { id: 'mis-vacaciones', title: 'Mis Vacaciones', url: '/recursos-humanos?tab=mis-vacaciones', icon: Calendar },
        { id: 'mi-equipo', title: 'Mi Equipo', url: '/recursos-humanos?tab=mi-equipo', icon: Briefcase, roles: ['líder', 'admin'] },
        { id: 'organigrama', title: 'Organigrama', url: '/organigrama', icon: Users },
    ]
};

const departmentNavConfig = [
  { title: "Operativo", url: "/operativo", icon: BarChart3 },
  { title: "Financiero", url: "/financiero", icon: DollarSign },
  { title: "Consultoría", url: "/consultoria", icon: Search },
  { title: "Directivo", url: "/directivo", icon: Users },
  { title: "Dinamic", url: "/dinamic", icon: Zap },
];

const adminNavConfig = [
   {
    id: 'gestion-dashboards',
    title: 'Gestión de Dashboards',
    icon: LayoutDashboard,
    url: '/admin/GestionDashboards',
    roles: ['admin', 'rh'],
  },
  {
    id: 'rrhh',
    title: 'Gestión RRHH',
    icon: Settings,
    roles: ['admin', 'rh'],
    subItems: [
      { id: 'equipo', title: 'Gestión de Equipo', url: '/admin/recursos-humanos', icon: Users },
      { id: 'contratos', title: 'Gestión de Contratos', url: '/admin/contratos', icon: FileText },
      { id: 'anuncios', title: 'Gestionar Anuncios', url: '/admin/GestionAnuncios', icon: Megaphone },
      { id: 'organigrama', title: 'Gestionar Organigrama', url: '/admin/recursos-humanos/organigrama/editar', icon: Users },
    ]
  },
    {
    id: 'sync-hub',
    title: 'Sync Hub',
    icon: GitBranch,
    url: '/admin/sync-hub',
    roles: ['admin'],
  },
  {
    id: 'usuarios',
    title: 'Admin Usuarios',
    icon: ShieldCheck,
    url: '/admin/usuarios',
    roles: ['admin'],
  }
];

// --- COMPONENTES AUXILIARES DE RENDERIZADO ---

const NavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;
  const isActive = item.exact ? currentPath === item.url : currentPath.startsWith(item.url);

  return (
    <SidebarMenuItem>
      <NavLink
        to={item.url}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 group ${
          isActive
            ? "bg-primary/10 text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        } ${collapsed ? 'justify-center' : ''}`}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span className="flex-1">{item.title}</span>}
      </NavLink>
    </SidebarMenuItem>
  );
};

const CollapsibleNav = ({ item, collapsed, userRole }) => {
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const visibleSubItems = useMemo(() => 
    item.subItems.filter(sub => !sub.roles || sub.roles.includes(userRole)), 
    [item.subItems, userRole]
  );
  
  const isChildActive = useMemo(() => 
    visibleSubItems.some(sub => sub.exact ? currentPath === sub.url : currentPath.startsWith(sub.url)),
    [visibleSubItems, currentPath]
  );

  const [isOpen, setIsOpen] = useState(isChildActive);
  useEffect(() => { setIsOpen(isChildActive); }, [isChildActive]);

  if (visibleSubItems.length === 0) return null;

  return (
    <div>
      <div
        onClick={() => !collapsed && setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 group cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/50 ${collapsed ? 'justify-center' : ''}`}
      >
        <item.icon className="h-5 w-5 flex-shrink-0" />
        {!collapsed && <span className="flex-1">{item.title}</span>}
        {!collapsed && <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </div>
      {!collapsed && isOpen && (
        <div className="pl-6 space-y-1 mt-1">
          {visibleSubItems.map(subItem => <NavItem key={subItem.id} item={subItem} collapsed={false} />)}
        </div>
      )}
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA BARRA LATERAL ---
export const DashboardSidebar = () => {
  const { state } = useSidebar();
  const { profile, loading } = useAuth();
  const collapsed = state === "collapsed";
  const userRole = profile?.role?.toLowerCase();

  const dashboardsMenu = useMemo(() => ({
    id: 'dashboards',
    title: 'Dashboards',
    icon: FileText,
    subItems: departmentNavConfig.map(depto => ({
      id: depto.title.toLowerCase(),
      ...depto,
    })),
  }), []);

  if (loading || !userRole) {
      return <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-background/80 backdrop-blur-sm`} />;
  }

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-background/80 backdrop-blur-sm`}>
      <div className="h-16 flex items-center justify-start px-3 border-b">
        <img src={DinamicLogo} alt="Dinamic Software Logo" className={`transition-all duration-300 ${collapsed ? 'h-7' : 'h-8'}`} />
        {!collapsed && <span className="ml-2 text-lg font-semibold">Dinamic Software</span>}
      </div>

      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {baseNavItems.map(item => <NavItem key={item.id} item={item} collapsed={collapsed} />)}
          <CollapsibleNav item={recursosHumanosNavConfig} collapsed={collapsed} userRole={userRole} />
          <CollapsibleNav item={dashboardsMenu} collapsed={collapsed} userRole={userRole} />
          <SidebarSeparator className="my-2 border-dashed" />
          {adminNavConfig
            .filter(item => item.roles.includes(userRole))
            .map(item => 
              item.subItems 
                ? <CollapsibleNav key={item.id} item={item} collapsed={collapsed} userRole={userRole} /> 
                : <NavItem key={item.id} item={item} collapsed={collapsed} />
          )}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
