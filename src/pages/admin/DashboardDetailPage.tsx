import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { WidgetRenderer as Widget } from '@/components/widgets/WidgetRenderer';
import { AddWidgetDialog } from '@/components/widgets/AddWidgetDialog';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import './DashboardDetailPage.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

type WidgetData = Tables<'report_widgets', { schema: 'be_exponential' }>;

type DashboardDetails = {
  id: string;
  name: string;
  description: string;
  department: string;
  widgets: WidgetData[];
};

export default function DashboardDetailPage() {
  const { id: dashboardId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<DashboardDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchDashboardDetails = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_dashboard_details', { p_dashboard_id: id })
        .single();

      if (error) throw error;
      if (!data) throw new Error('Dashboard no encontrado o la función no devolvió datos.');
      
      const sanitizedData = {
        ...data,
        widgets: (data.widgets || []).filter((w: any) => w.layout)
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
  }, [toast]);

  useEffect(() => {
    if (dashboardId) {
      fetchDashboardDetails(dashboardId);
    }
  }, [dashboardId, fetchDashboardDetails]);

  const handleWidgetSaved = useCallback(() => {
    if (dashboardId) {
      toast({
        title: "¡Widget guardado!",
        description: "Tu nuevo widget ha sido añadido al dashboard.",
      });
      fetchDashboardDetails(dashboardId);
    }
  }, [dashboardId, fetchDashboardDetails, toast]);

  const handleWidgetDeleted = useCallback((widgetId: string) => {
    setDashboard(prev => {
        if (!prev) return null;
        return {
            ...prev,
            widgets: prev.widgets.filter(w => w.id !== widgetId)
        };
    });
  }, []);

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
          ...(widget.layout as any),
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
              <CardDescription>{dashboard.description || 'Sin descripción'}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? 'Guardar Cambios' : 'Modo Edición'}
              </Button>
              {dashboardId && 
                <AddWidgetDialog 
                  dashboardId={dashboardId} 
                  onSave={handleWidgetSaved} 
                  widgets={dashboard.widgets}
                />}
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        draggableCancel=".widget-toolbar"
      >
        {dashboard.widgets.map(widget => (
          <div key={widget.id} className={`${isEditMode ? 'editing-widget' : ''}`}>
            <Widget 
              widget={widget} 
              isEditMode={isEditMode} 
              onWidgetDeleted={handleWidgetDeleted}
              onWidgetUpdated={handleWidgetSaved}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
}
