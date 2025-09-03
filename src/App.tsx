import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/auth/LoginForm";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { OperativoPage } from "./pages/OperativoPage";
import { FinancieroPage } from "./pages/FinancieroPage";
import { ConsultoriaPage } from "./pages/ConsultoriaPage";
import { DirectivoPage } from "./pages/DirectivoPage";
import { DinamicPage } from "./pages/DinamicPage";
import { ReportManager } from "./components/reports/ReportManager";
import { ReportViewer } from "./pages/ReportViewer";
import NotFound from "./pages/NotFound";
import UsersAdmin from "./pages/UsersAdmin";
import ProfileSettings from "./pages/ProfileSettings";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string>('');

  const handleLogin = (email: string, role: string, remember: boolean) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('dinamic_user_email', email);
    if (remember) {
      localStorage.setItem('dinamic_auth', 'true');
      localStorage.setItem('dinamic_user_role', role);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('');
    localStorage.removeItem('dinamic_auth');
    localStorage.removeItem('dinamic_user_role');
  };

  // Check for saved authentication
  useState(() => {
    const savedAuth = localStorage.getItem('dinamic_auth');
    const savedRole = localStorage.getItem('dinamic_user_role');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      setUserRole(savedRole || '');
    }
  });

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <LoginForm onLogin={handleLogin} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <DashboardLayout onLogout={handleLogout} userRole={userRole}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/operativo" element={<OperativoPage />} />
              <Route path="/financiero" element={<FinancieroPage />} />
              <Route path="/consultoria" element={<ConsultoriaPage />} />
              <Route path="/directivo" element={<DirectivoPage />} />
              <Route path="/dinamic" element={<DinamicPage />} />
              <Route path="/reportes" element={<ReportManager />} />
              <Route path="/reportes/:id" element={<ReportViewer />} />
              <Route
                path="/admin/usuarios"
                element={userRole === 'Admin' ? <UsersAdmin /> : <Navigate to="/dashboard" replace />}
              />
              <Route path="/perfil" element={<ProfileSettings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </DashboardLayout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
