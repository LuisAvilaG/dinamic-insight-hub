import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { NewAddWidgetDialog } from '@/components/widgets/NewAddWidgetDialog';
import { Tables } from '@/types/supabase';

// Tipos
type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;
type Dashboard = Tables<'report_dashboards', { schema: 'be_exponential' }>;
type DashboardWithWidgets = Dashboard & { widgets: Widget[]; };

const NewDashboardDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [dashboard, setDashboard] = useState<DashboardWithWidgets | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- ESTADOS PARA LA EDICIÓN ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);

  const fetchDashboard = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_dashboard_details', { p_dashboard_id: id }).single();
      if (error) throw error;
      if (data) setDashboard(data as DashboardWithWidgets);
    } catch (error: any) {
      toast({ title: 'Error de Carga', description: `No se pudieron cargar los datos: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, [id]);

  // --- LÓGICA DE MANEJO DEL DIÁLOGO ---
  const handleAddWidgetClick = () => {
    setEditingWidget(null);
    setIsDialogOpen(true);
  };

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setIsDialogOpen(true);
  };

  const handleDialogSave = () => {
    fetchDashboard(); // Recarga todo el dashboard para reflejar los cambios
  };

  const handleDeleteWidget = (widgetId: string) => {
    if (!dashboard) return;
    setDashboard({
        ...dashboard,
        widgets: dashboard.widgets.filter(w => w.id !== widgetId)
    });
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen">Cargando...</div>;
  if (!dashboard) return <div className="flex justify-center items-center h-screen">Dashboard no encontrado.</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <h1 className="text-2xl font-bold">{dashboard.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2"><Label htmlFor="edit-mode-switch">Modo Edición</Label><Switch id="edit-mode-switch" checked={isEditMode} onCheckedChange={setIsEditMode} /></div>
          {isEditMode && <Button onClick={handleAddWidgetClick}><PlusCircle className="h-4 w-4 mr-2" />Añadir Widget</Button>}
        </div>
      </header>

      <div className="border-t pt-4">
        <WidgetGrid
          widgets={dashboard.widgets || []}
          isEditMode={isEditMode}
          onLayoutChange={() => {}} // Ya se maneja dentro del componente
          onEditWidget={handleEditWidget}
          onDeleteWidget={handleDeleteWidget}
        />
      </div>

      {/* --- DIÁLOGO DE CREACIÓN/EDICIÓN --- */}
      <NewAddWidgetDialog 
        dashboardId={dashboard.id}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={handleDialogSave}
        widgetToEdit={editingWidget}
      />
    </div>
  );
};

export default NewDashboardDetailPage;
