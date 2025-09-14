import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { AddWidget } from '@/components/widgets/AddWidget';
import { EditWidget } from '@/components/widgets/EditWidget'; 
import { WidgetGrid } from '@/components/widgets/WidgetGrid';
import { Tables } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Edit, Check } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Tipos
type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;
type Dashboard = Omit<Tables<'report_dashboards', { schema: 'be_exponential' }>, 'created_at' | 'updated_at' | 'id'> & {
    id: string;
    name: string;
    description: string;
    widgets: Widget[];
};

export function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    const { data, error } = await supabase.rpc('get_dashboard_details', { p_dashboard_id: id }).single();

    if (error) {
        console.error("Error al cargar los detalles del dashboard:", error);
        setDashboard(null);
        setWidgets([]);
    } else if (data) {
        setDashboard(data);
        setWidgets(data.widgets || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleEditWidget = (widget: Widget) => {
    setEditingWidget(widget);
    setIsEditModalOpen(true);
  };

  const handleDeleteWidget = async (widgetId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este widget? Es una acción irreversible.')) {
        return;
    }
    try {
        const { error } = await supabase.rpc('delete_widget', { p_widget_id: widgetId });
        if (error) throw error;
        toast({ title: '¡Widget eliminado!', className: 'bg-green-100 text-green-800' });
        fetchData();
    } catch (error: any) {
        console.error("Error al eliminar el widget:", error);
        toast({ title: 'Error al eliminar el widget', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen w-full bg-background"><p className="text-muted-foreground">Cargando dashboard...</p></div>;
  }
  
  if (!dashboard) {
    return <div className="flex items-center justify-center min-h-screen w-full bg-background"><p className="text-destructive">Dashboard no encontrado o error al cargar.</p></div>;
  }

  return (
    <main className="min-h-screen w-full bg-background p-4 sm:p-6 md:p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
            <h1 className="text-3xl font-bold text-foreground">{dashboard.name}</h1>
            {dashboard.description && <p className="text-muted-foreground mt-1">{dashboard.description}</p>}
        </div>
        
        <div className="flex items-center space-x-4">
            {isEditMode && 
                <div className='flex items-center space-x-2'>
                    <AddWidget dashboardId={id!} onWidgetAdded={fetchData} widgets={widgets} />
                    <p style={{ color: 'red', fontSize: '16px', fontWeight: 'bold' }}>MARCADOR DE PRUEBA</p>
                </div>
            }
            <Button variant={isEditMode ? "default" : "outline"} onClick={() => setIsEditMode(!isEditMode)}>
                {isEditMode ? <Check className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />} 
                {isEditMode ? 'Finalizar Edición' : 'Editar Dashboard'}
            </Button>
        </div>
      </div>
      
      <WidgetGrid 
        widgets={widgets} 
        isEditMode={isEditMode}
        onLayoutChange={() => {}} 
        onEditWidget={handleEditWidget}
        onDeleteWidget={handleDeleteWidget}
      />

      {editingWidget && (
        <EditWidget
          widget={editingWidget}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          onWidgetUpdated={() => {
            fetchData();
            setIsEditModalOpen(false);
          }}
        />
      )}
    </main>
  );
}
