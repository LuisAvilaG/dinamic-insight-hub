
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WidgetTypeSelector } from './WidgetTypeSelector';
import { KpiConfig } from './config/KpiConfig';
import { TableConfig } from './config/TableConfig';
import { BarChartConfig } from './config/BarChartConfig';
import { LineChartConfig } from './config/LineChartConfig';
import { DonutChartConfig } from './config/DonutChartConfig';
import { buildWidgetQuery } from '@/lib/widget_query_builder';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/types/supabase';

// Tipos
type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;
type WidgetConfig = any; // Tipo genérico para la configuración

interface AddWidgetDialogProps {
  dashboardId: string;
  onSave: () => void;
  widgets: Widget[];
  trigger?: React.ReactNode;
  widgetToEdit?: Widget | null;
  isOpen?: boolean; // NUEVO: Para controlar la apertura
  onClose?: () => void; // NUEVO: Para controlar el cierre
}

export const AddWidgetDialog = ({
  dashboardId,
  onSave,
  widgets,
  trigger,
  widgetToEdit,
  isOpen,
  onClose,
}: AddWidgetDialogProps) => {
  const { toast } = useToast();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [widgetType, setWidgetType] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({});
  
  const isEditMode = !!widgetToEdit;

  useEffect(() => {
    // Si estamos en modo edición, inicializamos los estados
    if (isEditMode && widgetToEdit) {
      setWidgetType(widgetToEdit.widget_type);
      setWidgetConfig(widgetToEdit.config || {});
      setStep(2); // Ir directamente al paso de configuración
    }
  }, [widgetToEdit, isEditMode]);

  // Sincronizar el estado de apertura interno con el externo
  useEffect(() => {
    if (isOpen !== undefined) {
      setInternalIsOpen(isOpen);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setInternalIsOpen(false);
    }
    // Reiniciar estado al cerrar
    setTimeout(() => {
        if (!isEditMode) {
            setStep(1);
            setWidgetType(null);
            setWidgetConfig({});
        }
    }, 200);
  };

  const handleSave = async () => {
    try {
      const finalQuery = buildWidgetQuery(widgetType!, widgetConfig);
      
      const widgetPayload = {
        dashboard_id: dashboardId,
        widget_type: widgetType,
        config: { ...widgetConfig, query: finalQuery }, // Siempre incluir la query en la config
        ...(isEditMode ? {} : { layout: { w: 4, h: 4, x: 0, y: 0 } }) // Layout inicial solo para nuevos
      };
      
      let error;
      if (isEditMode) {
        // Actualizar widget existente
        const { error: updateError } = await supabase
          .from('report_widgets')
          .update(widgetPayload)
          .eq('id', widgetToEdit.id);
        error = updateError;
      } else {
        // Crear nuevo widget
        const { error: createError } = await supabase
          .from('report_widgets')
          .insert(widgetPayload);
        error = createError;
      }

      if (error) throw error;
      
      toast({
        title: `Widget ${isEditMode ? 'actualizado' : 'creado'}`,
        description: `El widget se ha ${isEditMode ? 'actualizado' : 'guardado'} exitosamente.`,
      });

      onSave(); // Refrescar el dashboard
      handleClose();

    } catch (error: any) {
      console.error("Error al guardar el widget:", error);
      toast({
        title: 'Error al guardar',
        description: `No se pudo guardar el widget: ${error.message || 'Error desconocido'}`,
        variant: 'destructive',
      });
    }
  };

  const renderConfigStep = () => {
    const props = { config: widgetConfig, onConfigChange: setWidgetConfig };
    switch (widgetType) {
      case 'kpi':
        return <KpiConfig {...props} />;
      case 'table':
      case 'data_table':
        return <TableConfig {...props} />;
      case 'bar_chart':
        return <BarChartConfig {...props} />;
      case 'line_chart':
      case 'time_series':
        return <LineChartConfig {...props} />;
      case 'donut_chart':
        return <DonutChartConfig {...props} />;
      default:
        return <p>Por favor, selecciona un tipo de widget.</p>;
    }
  };

  return (
    <Dialog open={internalIsOpen} onOpenChange={isOpen === undefined ? setInternalIsOpen : undefined}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Editar' : 'Añadir'} Widget</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-y-auto p-4">
          {step === 1 && (
            <WidgetTypeSelector onSelectType={(type) => {
              setWidgetType(type);
              setStep(2);
            }} />
          )}

          {step === 2 && (
            <div>
              <Button variant="link" onClick={() => setStep(1)} disabled={isEditMode}>
                &larr; Volver a seleccionar tipo
              </Button>
              {renderConfigStep()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          {step === 2 && (
            <Button onClick={handleSave}>
              {isEditMode ? 'Guardar Cambios' : 'Crear Widget'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
