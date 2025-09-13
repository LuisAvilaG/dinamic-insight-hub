import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Widget } from '@/components/widgets/Widget';
import { AddWidget } from '@/components/widgets/AddWidget';
import { Loader2 } from 'lucide-react';

const ResponsiveGridLayout = WidthProvider(Responsive);

type WidgetData = {
  id: string;
  dashboard_id: string;
  title: string;
  type: string;
  position: { x: number, y: number, w: number, h: number };
  query: string;
  options: object;
  created_at: string;
};

type DashboardDetails = {
  id: string;
  name: string;
  description: string;
  department: string;
  widgets: WidgetData[];
};

export default function DashboardDetailPage() {
  // =====================================================================================
  // CORRECCIÓN DEFINITIVA: Sincronizar el nombre del parámetro de la ruta.
  // La ruta en App.tsx se define como '/admin/dashboards/:id'. Por lo tanto, useParams()
  // nos dará un objeto con una propiedad `id`. Aquí, renombramos `id` a `dashboardId`
  // para mantener la coherencia con el resto del componente sin cambiar cada variable.
  // Este desajuste era la causa raíz de la pantalla de carga infinita.
  // =====================================================================================
  const { id: dashboardId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (dashboardId) {
      fetchDashboardDetails(dashboardId);
    }
  }, [dashboardId]);

  const fetchDashboardDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_details', { p_dashboard_id: id })
        .single();

      if (error) throw error;
      if (!data) throw new Error('Dashboard no encontrado o la función no devolvió datos.');
      
      const sanitizedData = {
        ...data,
        widgets: (data.widgets || []).filter((w: WidgetData) => w.position)
      };

      setDashboard(sanitizedData);

    } catch (error: any) {
      toast({
        title: 'Error al cargar el dashboard',
        description: `No se pudo obtener la información: ${error.message}`,
        variant: 'destructive',
      });
      setDashboard(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const onWidgetAdded = () => {
    if (dashboardId) {
      fetchDashboardDetails(dashboardId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
        <p className="ml-4 text-lg">Cargando Dashboard...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Dashboard no encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>El dashboard que buscas no existe o no se pudo cargar la información.</p>
        </CardContent>
      </Card>
    );
  }
  
  const layouts = {
      lg: dashboard.widgets.map(widget => ({
          ...widget.position,
          i: widget.id.toString(),
      }))
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{dashboard.name}</CardTitle>
              <CardDescription>{dashboard.description || 'Sin descripción'} - <span className="font-semibold">{dashboard.department}</span></CardDescription>
            </div>
            <AddWidget dashboardId={dashboard.id} onWidgetAdded={onWidgetAdded} />
          </div>
        </CardHeader>
      </Card>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable
        isResizable
      >
        {dashboard.widgets.map(widget => (
          <div key={widget.id}>
            <Widget data={widget} />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
