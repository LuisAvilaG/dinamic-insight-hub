
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';
import { Layout } from 'react-grid-layout';

type WidgetData = Tables<'report_widgets', { schema: 'be_exponential' }>;
type WidgetType = 'kpi' | 'table' | 'bar_chart' | 'line_chart' | 'donut_chart';

interface WidgetEditorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dashboardId: string;
  allWidgets: WidgetData[];
  widgetToEdit?: WidgetData | null;
  widgetTypeToAdd?: WidgetType;
}

const getNextAvailablePosition = (widgets: WidgetData[]): { x: number; y: number } => {
    if (!widgets.length) return { x: 0, y: 0 };
    const occupied = new Set<string>();
    let maxY = 0;
    widgets.forEach(widget => {
      const layout = widget.layout as unknown as Layout;
      if (layout) {
        for (let y = layout.y; y < layout.y + layout.h; y++) {
          for (let x = layout.x; x < layout.x + layout.w; x++) {
            occupied.add(`${x},${y}`);
          }
        }
        maxY = Math.max(maxY, layout.y + layout.h);
      }
    });
    for (let y = 0; y < Infinity; y++) {
      for (let x = 0; x < 12; x++) {
        if (!occupied.has(`${x},${y}`)) return { x, y };
      }
    }
    return { x: 0, y: maxY };
};

export function WidgetEditorDialog({
  isOpen,
  onClose,
  onSuccess,
  dashboardId,
  allWidgets,
  widgetToEdit,
  widgetTypeToAdd,
}: WidgetEditorDialogProps) {
  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isEditing = !!widgetToEdit;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        // We are editing an existing widget
        setTitle(widgetToEdit.config?.title || '');
        setQuery(widgetToEdit.config?.query || '');
      } else {
        // We are creating a new one, reset fields
        setTitle('');
        setQuery('');
      }
    }
  }, [isOpen, widgetToEdit, isEditing]);

  const handleSave = async () => {
    if (!title || !query) {
      toast({ title: 'Faltan datos', description: 'Por favor, completa el título y la consulta.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        // ------- UPDATE LOGIC -------
        const updatedConfig = { ...widgetToEdit.config, title, query };
        const { error } = await supabase.rpc('update_widget', {
            p_widget_id: widgetToEdit.id,
            p_config: updatedConfig,
            p_layout: widgetToEdit.layout
        });
        if (error) throw error;
        toast({ title: '¡Widget Actualizado!', description: `El widget "${title}" se ha guardado.` });
      } else {
        // ------- CREATE LOGIC -------
        const newPosition = getNextAvailablePosition(allWidgets);
        const newLayout = {
          x: newPosition.x,
          y: newPosition.y,
          w: widgetTypeToAdd === 'table' ? 6 : 3,
          h: widgetTypeToAdd === 'kpi' ? 2 : 4,
        };
        const { error } = await supabase.rpc('insert_widget', {
          p_dashboard_id: dashboardId,
          p_widget_type_text: widgetTypeToAdd,
          p_config: { title, query },
          p_layout: newLayout
        });
        if (error) throw error;
        toast({ title: '¡Widget Creado!', description: `El widget "${title}" se ha añadido.` });
      }
      onSuccess(); // This will trigger the dashboard to refresh
    } catch (error: any) {
      console.error("Error al guardar el widget:", error);
      toast({ title: 'Error al guardar', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Widget' : 'Crear Nuevo Widget'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los detalles de tu widget.'
              : 'Completa la configuración para tu nuevo widget.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="widget-title">Título del Widget</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Ventas Mensuales"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="widget-query">Consulta SQL</Label>
            <Textarea
              id="widget-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SELECT categoria, COUNT(*) AS total FROM ventas GROUP BY categoria;"
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
