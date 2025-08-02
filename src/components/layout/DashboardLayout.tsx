import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

interface DashboardLayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

export const DashboardLayout = ({ children, onLogout }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader onLogout={onLogout} />
          
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-accent/10 to-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};