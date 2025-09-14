import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WidgetRenderer } from './WidgetRenderer';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';
import { WidgetToolbar } from './WidgetToolbar';

// Tipos
type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface WidgetGridProps {
  widgets: Widget[];
  isEditMode: boolean; // Prop para controlar el modo de edición
  onLayoutChange: (layouts: Layout[]) => void;
  onEditWidget: (widget: Widget) => void; 
  onDeleteWidget: (widgetId: string) => void; // La función ahora espera el ID del widget
}

const ResponsiveGridLayout = WidthProvider(Responsive);

export const WidgetGrid = ({ widgets, isEditMode, onLayoutChange, onEditWidget, onDeleteWidget }: WidgetGridProps) => {

  const handleLayoutChange = async (newLayout: Layout[]) => {
    // Solo guardar cambios de layout si estamos en modo edición
    if (!isEditMode) return;

    onLayoutChange(newLayout);
    for (const item of newLayout) {
      try {
        await supabase.rpc('update_widget_layout', { 
          p_widget_id: item.i, 
          p_layout: { x: item.x, y: item.y, w: item.w, h: item.h }
        });
      } catch (error) {
        console.error("Error al guardar el layout:", error);
      }
    }
  };

  // Mapear los widgets al formato que react-grid-layout espera
  const layouts = {
    lg: widgets.map(w => ({ ...(w.layout as any), i: w.id.toString() }))
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
      cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
      rowHeight={100}
      onLayoutChange={handleLayoutChange}
      // --- CONTROL DEL MODO DE EDICIÓN ---
      isDraggable={isEditMode}
      isResizable={isEditMode}
      isBounded={true} // Evita que los widgets se salgan de la parrilla
      draggableHandle='.widget-drag-handle'
    >
      {widgets.map(widget => (
        <div key={widget.id} className={`group bg-white rounded-lg shadow-sm border overflow-hidden ${isEditMode ? 'border-blue-500 border-dashed' : ''}`}>
          <WidgetToolbar 
            widgetId={widget.id}
            isEditMode={isEditMode} // Pasar el estado al toolbar
            onEdit={() => onEditWidget(widget)} 
            onDelete={() => onDeleteWidget(widget.id)} // Llamar a la función de borrado con el ID
          />
          <div className="p-4 h-full w-full">
             <WidgetRenderer widget={widget as any} />
          </div>
        </div>
      ))}
    </ResponsiveGridLayout>
  );
};
