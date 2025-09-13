import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  DollarSign, 
  Search, 
  Users, 
  Zap,
  Calendar,
  Sparkles,
  Building2,
  Activity
} from "lucide-react";
import { DepartmentCardsConnected } from "./DepartmentCardsConnected";
import { RelevantMilestones } from "./RelevantMilestones";
import { QuickStatsConnected } from "./QuickStatsConnected"; // Import the new connected component

export const DashboardHome = () => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent-purple p-8 text-white shadow-dinamic">
        <div className="absolute inset-0 pattern-dinamic opacity-20"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <Sparkles className="h-8 w-8" />
              <h1 className="text-4xl font-bold">
                Bienvenido a Dinamic Software
              </h1>
            </div>
            <p className="text-white/90 text-lg max-w-2xl">
              Tu plataforma de Business Intelligence para la toma de decisiones inteligentes
            </p>
            <p className="text-white/70 text-sm mt-2">
              Generamos innovación, buscamos crecimiento
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/80">
            <Calendar className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats - Now using the connected component */}
      <QuickStatsConnected />

      {/* Department Cards */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6 flex items-center">
          <BarChart3 className="mr-3 h-6 w-6 text-primary" />
          Departamentos
        </h2>
        <DepartmentCardsConnected />
      </div>

      {/* Relevant Milestones */}
      <RelevantMilestones />
    </div>
  );
};