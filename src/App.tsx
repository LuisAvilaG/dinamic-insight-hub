
import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { OperativoPage } from "./pages/OperativoPage";
import { FinancieroPage } from "./pages/FinancieroPage";
import { ConsultoriaPage } from "./pages/ConsultoriaPage";
import { DirectivoPage } from "./pages/DirectivoPage";
import { DinamicPage } from "./pages/DinamicPage";
import { ReportManager } from "./components/reports/ReportManager";
import { ReportViewer } from "./pages/ReportViewer";
import { RecursosHumanosPage } from "./pages/RecursosHumanosPage";
import { GestionRecursosHumanosPage } from "./pages/admin/GestionRecursosHumanosPage";
import VistaGlobalContratos from "./pages/admin/contratos";
import GestionDashboardsPage from "./pages/admin/GestionDashboards";
import DashboardDetailPage from "./pages/admin/DashboardDetailPage";
import WidgetEditor from "./views/WidgetEditor"; // <-- Import the new editor
import NotFound from "./pages/NotFound";
import UsersAdmin from "./pages/UsersAdmin";
import ProfileSettings from "./pages/ProfileSettings";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const AppLoader = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <p className="text-muted-foreground">Cargando aplicación...</p>
  </div>
);

const ProtectedRoute = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const AdminRoute = () => {
  const { profile } = useAuth();
  if (profile?.role?.toLowerCase() !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AdminOrHrRoute = () => {
  const { profile } = useAuth();
  const userRole = profile?.role?.toLowerCase();
  if (userRole !== 'admin' && userRole !== 'rh') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const logUserLogin = async () => {
      if (user) {
        try {
          await supabase.from('user_logins').insert({ user_id: user.id });
        } catch (error) {
          console.error("Error logging user login:", error);
        }
      }
    };
    logUserLogin();
  }, [user]);

  if (loading) {
    return <AppLoader />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="operativo" element={<OperativoPage />} />
          <Route path="financiero" element={<FinancieroPage />} />
          <Route path="consultoria" element={<ConsultoriaPage />} />
          <Route path="directivo" element={<DirectivoPage />} />
          <Route path="dinamic" element={<DinamicPage />} />
          <Route path="reportes" element={<ReportManager />} />
          <Route path="reportes/:id" element={<ReportViewer />} />
          <Route path="recursos-humanos" element={<RecursosHumanosPage />} />
          <Route path="perfil" element={<ProfileSettings />} />

          {/* Rutas solo para Admin */}
          <Route element={<AdminRoute />}>
            <Route path="admin/usuarios" element={<UsersAdmin />} />
          </Route>

          {/* Rutas para Admin y RRHH */}
          <Route element={<AdminOrHrRoute />}>
            <Route path="admin/recursos-humanos" element={<GestionRecursosHumanosPage />} />
            <Route path="admin/contratos" element={<VistaGlobalContratos />} />
            <Route path="admin/GestionDashboards" element={<GestionDashboardsPage />} />
            <Route path="admin/dashboards/:id" element={<DashboardDetailPage />} />
            {/* --- Rutas para el editor de widgets --- */}
            <Route path="admin/dashboards/:id/widgets/new" element={<WidgetEditor />} />
            <Route path="admin/dashboards/:id/widgets/:widgetId/edit" element={<WidgetEditor />} />
          </Route>

        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
