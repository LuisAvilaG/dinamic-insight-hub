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
  Activity,
  BarChart2
} from "lucide-react";
import { DepartmentCardsConnected } from "./DepartmentCardsConnected";
import { RelevantMilestones } from "./RelevantMilestones";
import { QuickStatsConnected } from "./QuickStatsConnected"; 
import { useAuth } from "@/contexts/AuthContext";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const DashboardHeader = () => {
  const { profile } = useAuth();
  const today = format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
          <div>
              <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500 flex items-center">
                  <Sparkles className="h-8 w-8 mr-3 text-primary" />
                  Bienvenido, {profile?.Nombre?.split(' ')[0] || 'a Dinamic Software'}
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">Tu plataforma de Business Intelligence para la toma de decisiones inteligentes.</p>
          </div>
          <div className="text-sm text-muted-foreground hidden md:block">
              {today}
          </div>
      </div>
    </div>
  );
}

export const DashboardHome = () => {
  return (
    <div className="space-y-8 relative overflow-hidden p-1">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] opacity-30 z-0"></div>
      
      <div className="relative z-10 space-y-8">
        <DashboardHeader />

        {/* Section: General Stats */}
        <div>
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center"><BarChart2 className="mr-2 h-5 w-5 text-primary"/>Resumen General</h2>
            <QuickStatsConnected />
        </div>

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
    </div>
  );
};
