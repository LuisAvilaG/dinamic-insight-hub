
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/types/supabase';
import { WidgetGrid } from '@/components/widgets/WidgetGrid'; // Importar el WidgetGrid correcto

// Tipos
type Dashboard = Tables<'report_dashboards', { schema: 'be_exponential' }>;
type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

export const ReportViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboardAndWidgets = async () => {
      if (!id) {
        navigate('/dashboards');
        return;
      }

      setIsLoading(true);
      try {
        // Fetch dashboard details
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('report_dashboards')
          .select('*')
          .eq('id', id)
          .schema('be_exponential')
          .maybeSingle();

        if (dashboardError) throw dashboardError;

        if (!dashboardData) {
          toast({ title: "Error", description: "Dashboard no encontrado", variant: "destructive" });
          navigate('/dashboards');
          return;
        }
        
        setDashboard(dashboardData);

        // Fetch associated widgets
        const { data: widgetsData, error: widgetsError } = await supabase
          .from('report_widgets')
          .select('*')
          .eq('dashboard_id', id)
          .schema('be_exponential');

        if (widgetsError) throw widgetsError;

        setWidgets(widgetsData || []);

      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast({ title: "Error", description: "No se pudo cargar el dashboard", variant: "destructive" });
        navigate('/dashboards');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardAndWidgets();
  }, [id, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-4 text-muted-foreground">Cargando dashboard...</span>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{dashboard.name}</h1>
          {dashboard.description && (
            <p className="text-muted-foreground max-w-3xl mt-1">{dashboard.description}</p>
          )}
        </div>
      </div>

      {/* Widget Grid - Ahora usando el componente WidgetGrid */}
      {widgets.length > 0 ? (
        <WidgetGrid 
          widgets={widgets}
          isEditMode={false} // Siempre en modo visualización
          onLayoutChange={() => {}} // No se necesita en modo visualización
          onEditWidget={() => {}}   // No se necesita en modo visualización
          onDeleteWidget={() => {}} // No se necesita en modo visualización
        />
      ) : (
        <Card className="flex flex-col items-center justify-center p-12 border-dashed">
           <AlertTriangle className="h-12 w-12 text-yellow-500" />
           <CardTitle className="mt-4">Sin widgets</CardTitle>
          <CardDescription className="mt-2 text-center">
            Este dashboard aún no tiene widgets configurados.
          </CardDescription>
        </Card>
      )}
    </div>
  );
};
