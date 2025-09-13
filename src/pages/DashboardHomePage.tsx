
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, LineChart, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from 'date-fns';

// Componente reutilizable para las tarjetas de estadísticas
interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
  icon: React.ElementType;
  loading: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, changeType, icon: Icon, loading }) => {
  const isIncrease = changeType === 'increase';
  const changeColor = isIncrease ? 'text-emerald-500' : 'text-red-500';
  const ChangeIcon = isIncrease ? ArrowUp : ArrowDown;

  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white rounded-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-12 flex items-center">
            <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
          </div>
        ) : (
          <>
            <div className="text-3xl font-bold text-gray-800">{value}</div>
            {change && (
              <p className={`text-xs ${changeColor} flex items-center mt-1`}>
                <ChangeIcon className="h-3 w-3 mr-1" />
                {change} vs mes anterior
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Datos estáticos para la tabla de actividad reciente (se mantiene sin cambios)
const recentActivities = [
  { user: "Ana García", action: "Generó el reporte de ventas Q3", time: "Hace 5 min", type: "Reporte" },
  { user: "Carlos Ruiz", action: "Actualizó el dashboard financiero", time: "Hace 2 horas", type: "Dashboard" },
  { user: "Beatriz León", action: "Añadió 3 nuevos usuarios al sistema", time: "Hace 6 horas", type: "Usuario" },
  { user: "David Costa", action: "Consultó el reporte de KPI de marketing", time: "Ayer", type: "Consulta" },
  { user: "Elena Muñoz", action: "Generó el reporte de inventario mensual", time: "Ayer", type: "Reporte" },
];

// El componente principal del dashboard, ahora dinámico
export default function DashboardHomePage() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalDashboards, setTotalDashboards] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

        const [
          { data: usersData, error: usersError },
          { count: dashboardCount, error: dashboardError }
        ] = await Promise.all([
          supabase.from('Cuentas').select('ultimo_acceso'),
          supabase
            .from('report_dashboards')
            .select('*', { count: 'exact', head: true })
            .schema('be_exponential')
        ]);
        
        if (usersError) throw usersError;
        if (dashboardError) throw dashboardError;

        const activeCount = usersData.filter(u => u.ultimo_acceso && new Date(u.ultimo_acceso) > new Date(thirtyDaysAgo)).length;
        
        setActiveUsers(activeCount);
        setTotalUsers(usersData.length);
        setTotalDashboards(dashboardCount || 0);

      } catch (error) {
        console.error("Error al cargar las estadísticas del dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Dashboards" value={totalDashboards.toString()} loading={loading} icon={FileText} /> 
        <StatCard title="Usuarios Activos (30d)" value={activeUsers.toString()} loading={loading} icon={Users} />
        <StatCard title="Total de Cuentas" value={totalUsers.toString()} loading={loading} icon={Users} />
        <StatCard title="Tiempo Promedio" value="2.3m" loading={loading} icon={LineChart} />
      </div>

      {/* La tabla de actividad reciente se mantiene igual */}
      <Card className="border-0 shadow-sm bg-white rounded-lg">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead className="text-right">Tiempo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-gray-700">{activity.user}</TableCell>
                  <TableCell className="text-gray-600">
                    {activity.action}
                    <Badge variant="outline" className="ml-2 font-normal border-gray-300 text-gray-500">{activity.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
