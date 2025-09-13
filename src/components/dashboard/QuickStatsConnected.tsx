import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2,
  Users,
  Calendar,
  TrendingUp
} from "lucide-react";

export const QuickStatsConnected = () => {
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      
      // Fetch the total count of reports
      const { count, error } = await supabase
        .from('reportes')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error("Error fetching report count:", error);
      } else {
        setTotalReports(count || 0);
      }
      
      setLoading(false);
    };

    fetchStats();
  }, []);

  // We use the fetched data for 'Total Reportes' and placeholders for the others.
  const quickStats = [
    {
      title: "Total Reportes",
      value: loading ? "..." : totalReports.toString(),
      change: "+12%", // Placeholder
      icon: Building2,
      positive: true
    },
    {
      title: "Usuarios Activos",
      value: "24", // Placeholder
      change: "+8%", 
      icon: Users,
      positive: true
    },
    {
      title: "Actualizaciones Hoy",
      value: "18", // Placeholder
      change: "+5%",
      icon: Calendar,
      positive: true
    },
    {
      title: "Tiempo Promedio",
      value: "2.3m", // Placeholder
      change: "-15%",
      icon: TrendingUp,
      positive: false
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => (
        <Card key={index} className="card-interactive border-0 shadow-md hover:shadow-dinamic">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 dinamic-icon flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <Badge 
                variant={stat.positive ? "default" : "destructive"}
                className="text-xs bg-primary/10 text-primary border border-primary/20"
              >
                {stat.change} vs mes anterior
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};