import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  DollarSign, 
  Search, 
  Users, 
  Zap,
  ArrowRight
} from "lucide-react";

// Configuration for each department card
const departmentConfig: any = {
  Operativo: { icon: BarChart3, color: "from-blue-500 to-blue-600", description: "Reportes y métricas operacionales", url: "/operativo" },
  Financiero: { icon: DollarSign, color: "from-green-500 to-green-600", description: "Análisis financiero y presupuestos", url: "/financiero" },
  Consultoría: { icon: Search, color: "from-purple-500 to-purple-600", description: "Reportes de proyectos y consultoría", url: "/consultoria" },
  Directivo: { icon: Users, color: "from-orange-500 to-orange-600", description: "Dashboard ejecutivo y KPIs", url: "/directivo" },
  Dinamic: { icon: Zap, color: "from-primary to-secondary", description: "Herramientas y utilidades Dinamic", url: "/dinamic" },
};

// Interface for the report data we fetch
interface Report {
  id: string;
  departamento: string;
  updated_at: string;
  frecuencia_actualizacion: string | null;
}

export const DepartmentCardsConnected = () => {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      setLoading(true);
      try {
        // Fetch reports including the new 'frecuencia_actualizacion' field
        const { data, error } = await (supabase as any)
          .from('reportes')
          .select('id, departamento, updated_at, frecuencia_actualizacion');

        if (error) {
          console.error("Error fetching reports:", error);
          return;
        }

        // Calculate report counts for each department
        const counts = data.reduce((acc: any, report: Report) => {
          acc[report.departamento] = (acc[report.departamento] || 0) + 1;
          return acc;
        }, {});

        // Find the most recently updated report for each department
        const latestReports = data.reduce((acc: any, report: Report) => {
          if (!acc[report.departamento] || new Date(report.updated_at) > new Date(acc[report.departamento].updated_at)) {
            acc[report.departamento] = report;
          }
          return acc;
        }, {});

        // Map the data for rendering
        const departmentData = Object.keys(departmentConfig).map(dept => {
          const latestReport = latestReports[dept];
          return {
            title: dept,
            ...departmentConfig[dept],
            reports: counts[dept] || 0,
            // Use the frequency from the latest report, or a default text
            updateInfo: latestReport ? latestReport.frecuencia_actualizacion : "N/A",
          };
        });

        setReportData(departmentData);

      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, []);

  // The component is now cleaner and directly shows the intended frequency text
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reportData.map((dept: any, index: number) => (
        <Card key={index} className="card-interactive group border-0 shadow-md hover:shadow-dinamic">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className={`w-12 h-12 bg-gradient-to-br ${dept.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <dept.icon className="h-6 w-6 text-white" />
              </div>
              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border border-primary/20">
                {dept.reports} reportes
              </Badge>
            </div>
            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
              {dept.title}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {dept.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {/* This now displays the update frequency text directly */}
                {dept.updateInfo}
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(dept.url)}
                className="group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:text-white transition-all"
              >
                Ver reportes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
