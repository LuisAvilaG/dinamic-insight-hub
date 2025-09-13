
import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  BarChart3, DollarSign, Search, Users, Zap, Home, FileText, ShieldCheck, Settings, ChevronDown, LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// --- ESTRUCTURA DE NAVEGACIÓN ---
const baseNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Recursos Humanos", url: "/recursos-humanos", icon: Users },
];

const departmentNavConfig = [
  { title: "Operativo", url: "/operativo", icon: BarChart3 },
  { title: "Financiero", url: "/financiero", icon: DollarSign },
  { title: "Consultoría", url: "/consultoria", icon: Search },
  { title: "Directivo", url: "/directivo", icon: Users },
  { title: "Dinamic", url: "/dinamic", icon: Zap },
];

const adminNavConfig = [
   {
    id: 'gestion-dashboards', // ID actualizado
    title: 'Gestión de Dashboards', // Título actualizado
    icon: LayoutDashboard, // Icono más apropiado
    url: '/admin/GestionDashboards', // URL actualizada
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
    ]
  },
  {
    id: 'usuarios',
    title: 'Admin Usuarios',
    icon: ShieldCheck,
    url: '/admin/usuarios',
    roles: ['admin'],
  }
];

// --- COMPONENTES DE NAVEGACIÓN ---

const SingleNavItem = ({ item, collapsed }) => (
  <SidebarMenuItem>
    <NavLink
      to={item.url}
      className={({ isActive }) => `
        flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 group
        ${isActive 
          ? "bg-primary/10 text-primary font-semibold" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <item.icon className={'h-5 w-5 flex-shrink-0'} />
      {!collapsed && <span className="flex-1">{item.title}</span>}
    </NavLink>
  </SidebarMenuItem>
);

const CollapsibleNavItem = ({ item, collapsed }) => {
  const location = useLocation();
  const isChildActive = useMemo(() => 
    item.subItems.some(sub => sub.url && location.pathname.startsWith(sub.url)),
    [item.subItems, location.pathname]
  );
  const [isOpen, setIsOpen] = useState(isChildActive);

  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive]);


  if (collapsed) {
    return item.subItems.map(subItem => 
      !subItem.isSeparator && <SingleNavItem key={subItem.id || subItem.title} item={subItem} collapsed={true} />
    );
  }

  return (
    <div className="space-y-1">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 group cursor-pointer 
          ${isChildActive ? 'text-foreground font-semibold' : 'text-muted-foreground'} hover:text-foreground hover:bg-muted/50`}
      >
        <item.icon className={'h-5 w-5 flex-shrink-0'} />
        <span className="flex-1">{item.title}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <div className="pl-6 space-y-1">
          {item.subItems.map(subItem => 
             <SingleNavItem key={subItem.id || subItem.title} item={subItem} collapsed={false} />
          )}
        </div>
      )}
    </div>
  )
}

// --- COMPONENTE PRINCIPAL DE LA BARRA LATERAL ---
export const DashboardSidebar = () => {
  const { state } = useSidebar();
  const { profile, loading } = useAuth();
  const collapsed = state === "collapsed";

  const dashboardsNavMenu = useMemo(() => { // Renombrada la variable
    const departmentSubItems = departmentNavConfig.map(depto => ({
      id: depto.title,
      title: depto.title,
      url: depto.url,
      icon: depto.icon
    }));

    return {
        id: 'dashboards', // ID actualizado
        title: 'Dashboards', // Título actualizado
        icon: FileText,
        subItems: departmentSubItems
    };
  }, []);

  const adminItems = useMemo(() => {
    if (loading || !profile) return [];
    const userRole = profile.role?.toLowerCase();
    return adminNavConfig.filter(item => item.roles.includes(userRole));
  }, [profile, loading]);

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r bg-background/80 backdrop-blur-sm`}>
      <div className="h-16 flex items-center justify-start px-3 border-b">
        <img 
          src="/logorecortado.png"
          alt="logorecortado"
          className={`transition-all duration-300 ${collapsed ? 'h-7' : 'h-8'}`}
        />
        {!collapsed && <span className="ml-2 text-lg font-semibold">Dinamic Software</span>}
      </div>

      <SidebarContent className="p-2">
        <SidebarMenu className="space-y-1">
          {baseNavItems.map((item) => (
            <SingleNavItem key={item.title} item={item} collapsed={collapsed} />
          ))}

          <CollapsibleNavItem item={dashboardsNavMenu} collapsed={collapsed} />

          {adminItems.length > 0 && <SidebarSeparator className="my-2 border-dashed" />}

          {adminItems.map((item) => (
            item.subItems 
              ? <CollapsibleNavItem key={item.id} item={item} collapsed={collapsed} />
              : <SingleNavItem key={item.id} item={item} collapsed={collapsed} />
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};
