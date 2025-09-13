import { Outlet } from "react-router-dom"; // 1. Import Outlet
import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";

// This layout component is used by React Router as a layout route.
// It renders the shared UI (Sidebar, Header) and an <Outlet />
// to render the matched child route.
export const DashboardLayout = () => { // No 'children' prop needed
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-6 bg-gradient-to-br from-background via-accent/10 to-muted/20">
            {/* 2. Render the Outlet here. This is where child routes like DashboardHome will appear. */}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};