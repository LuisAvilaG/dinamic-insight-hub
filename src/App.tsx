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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = (email: string, password: string, remember: boolean) => {
    // Simple authentication logic - in real app, validate with backend
    if (email && password) {
      setIsAuthenticated(true);
      if (remember) {
        localStorage.setItem('dinamic_auth', 'true');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dinamic_auth');
  };

  // Check for saved authentication
  useState(() => {
    const savedAuth = localStorage.getItem('dinamic_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
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
          <DashboardLayout onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/operativo" element={<OperativoPage />} />
              <Route path="/financiero" element={<FinancieroPage />} />
              <Route path="/consultoria" element={<ConsultoriaPage />} />
              <Route path="/directivo" element={<DirectivoPage />} />
              <Route path="/dinamic" element={<DinamicPage />} />
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
