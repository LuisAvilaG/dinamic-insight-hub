
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';
import { WidgetToolbar } from './WidgetToolbar';
import { useToast } from '@/hooks/use-toast';

import { KpiWidget } from "./KpiWidget";
import { BarChartWidget } from "./BarChartWidget";
// 1. Importar el nuevo widget
import AdvancedTableWidget from "./AdvancedTableWidget";

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface WidgetGridProps {
  widgets: Widget[];
  isEditMode: boolean;
  onLayoutChange: (layouts: Layout[]) => void;
  onEditWidget: (widget: Widget) => void; 
  onDeleteWidget: (widgetId: string) => void;
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export const WidgetGrid = ({ widgets, isEditMode, onLayoutChange, onEditWidget, onDeleteWidget }: WidgetGridProps) => {
  const { toast } = useToast();

  const handleLayoutChange = async (newLayout: Layout[]) => {
    if (!isEditMode || newLayout.length === 0) return;

    onLayoutChange(newLayout); 

    for (const item of newLayout) {
      try {
        const { error } = await supabase.rpc('update_widget_layout', { 
          p_widget_id: item.i,
          p_layout: { x: item.x, y: item.y, w: item.w, h: item.h }
        });
        if (error) throw new Error(`Error en widget ${item.i}: ${error.message}`);
      } catch (error) {
        console.error("Error al guardar el layout:", error);
        toast({ title: "Error de guardado", description: "No se pudo guardar la nueva posición/tamaño de un widget.", variant: "destructive" });
      }
    }
  };
  
  const layouts = {
    lg: widgets.map(w => {
      const layout = w.layout as any;
      // Definimos un tamaño por defecto más grande para la tabla avanzada
      const defaultWidth = w.widget_type === 'advanced_table' ? 12 : (w.widget_type === 'kpi' ? 4 : 6);
      const defaultHeight = w.widget_type === 'advanced_table' ? 6 : (w.widget_type === 'kpi' ? 2 : 4);
      return {
        i: w.id.toString(),
        x: layout?.x ?? 0,
        y: layout?.y ?? 0,
        w: layout?.w ?? defaultWidth,
        h: layout?.h ?? defaultHeight,
      };
    })
  };

  const handleDelete = async (widget: Widget) => {
    try {
      const widgetTitle = (widget.config as any)?.name || 'Sin título';
      const { error } = await supabase.rpc('delete_widget', { p_widget_id: widget.id });
      if (error) throw error;
      toast({ title: "Widget Eliminado", description: `El widget "${widgetTitle}" ha sido eliminado.` });
      onDeleteWidget(widget.id);
    } catch (error: any) {
      toast({ title: "Error al eliminar", description: `No se pudo eliminar: ${error.message}`, variant: "destructive" });
    }
  };

  const renderWidget = (widget: Widget) => {
    // Pasamos la configuración directamente al widget
    const props = { config: widget.config as any }; 
    switch (widget.widget_type) {
      case 'kpi':
        return <KpiWidget widget={widget} />;
      case 'bar_chart':
        return <BarChartWidget widget={widget} />;
      // 2. Añadir el caso para renderizar la tabla avanzada
      case 'advanced_table':
        return <AdvancedTableWidget {...props} />;
      default:
        return <div className="flex items-center justify-center h-full bg-slate-100 p-4"><p className="text-slate-500">Widget no soportado: {widget.widget_type}</p></div>;
    }
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={handleLayoutChange}
      isDraggable={isEditMode}
      isResizable={isEditMode}
      isBounded={true}
      draggableHandle=".widget-drag-handle"
    >
      {widgets.map(widget => (
        <div key={widget.id} className="group bg-white rounded-lg shadow-sm border overflow-hidden flex flex-col">
           <div className="flex-grow-0 flex-shrink-0 basis-auto p-4">
             <h3 className="font-semibold text-lg truncate">{(widget.config as any)?.name || 'Widget sin título'}</h3>
           </div>
          {isEditMode && <div className="widget-drag-handle cursor-grab active:cursor-grabbing w-full h-6 absolute top-0 left-0 z-10" />}
          {isEditMode && (
            <div className="absolute top-1 right-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <WidgetToolbar 
                widgetTitle={(widget.config as any)?.name || 'este widget'}
                onEdit={() => onEditWidget(widget)} 
                onDelete={() => handleDelete(widget)}
              />
            </div>
          )}
          <div className={`flex-grow w-full ${isEditMode ? 'opacity-50 pointer-events-none' : ''}`}>
             {renderWidget(widget)}
          </div>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};
