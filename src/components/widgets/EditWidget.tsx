import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { TableSelector } from './TableSelector'; 
import { ColumnSelector } from './ColumnSelector';
import { WidgetPreview } from './WidgetPreview';
import { Pencil } from 'lucide-react';

// Tipos que deben coincidir con los que ya se están utilizando en el proyecto.
type WidgetType = 'kpi' | 'table' | 'bar_chart' | 'line_chart';

type WidgetConfig = {
  title: string;
  dataSource: string | null;
  dimension: string | null;
  metric: string | null;
};

type WidgetFromDB = {
  id: string;
  type: WidgetType;
  title: string;
  query: string;
  config: any; // Se espera que config contenga la configuración del widget
};

interface PreviewData {
  [key: string]: any;
}

interface EditWidgetProps {
  widget: WidgetFromDB;
  onWidgetUpdated: () => void;
}

export function EditWidget({ widget, onWidgetUpdated }: EditWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData[] | null>(null);
  const [generatedQuery, setGeneratedQuery] = useState(widget.query || '');

  // Se carga la configuración inicial del widget cuando se abre el diálogo.
  useEffect(() => {
    if (isOpen) {
        const configOptions = widget.config?.options || {};
        setWidgetConfig({
            title: widget.title || '',
            dataSource: configOptions.dataSource || null,
            dimension: configOptions.dimension || null,
            metric: configOptions.metric || 'COUNT(*)',
        });
        setGeneratedQuery(widget.query || '');
    } else {
        setWidgetConfig(null);
        setPreviewData(null);
        setGeneratedQuery('');
    }
  }, [isOpen, widget]);

  // --- LÓGICA DE PREVISUALIZACIÓN ---
  useEffect(() => {
    if (!isOpen || !widgetConfig) return;

    const buildAndFetch = () => {
      if (!widgetConfig.dataSource || !widgetConfig.metric) {
        setGeneratedQuery('');
        setPreviewData(null);
        return;
      }

      const hasDimension = widget.type !== 'kpi' && widgetConfig.dimension;
      const dimensionSelect = hasDimension ? `\"${widgetConfig.dimension}\",` : '';
      const groupBy = hasDimension ? `GROUP BY \"${widgetConfig.dimension}\"` : '';
      const query = `SELECT ${dimensionSelect} ${widgetConfig.metric} as metric FROM be_exponential.${widgetConfig.dataSource} ${groupBy} ORDER BY metric DESC LIMIT 10`;
      
      setGeneratedQuery(query);

      const handler = setTimeout(async () => {
        try {
            const { data, error } = await supabase.rpc('execute_query', { p_query: query });
            if (error) throw error;
            setPreviewData(data);
        } catch(e: any) {
            setPreviewData([{ error: 'Error al cargar previsualización: ' + e.message }]);
        }
      }, 500);

      return () => clearTimeout(handler);
    };

    buildAndFetch();
  }, [widgetConfig, isOpen, widget.type]);

  // --- MANEJADOR DEL ENVÍO ---
  const handleSubmit = async () => {
    if (!widgetConfig) return;

    setIsSubmitting(true);

    try {
        const updatedConfig = {
            title: widgetConfig.title,
            query: generatedQuery,
            options: {
                dataSource: widgetConfig.dataSource,
                dimension: widget.type !== 'kpi' ? widgetConfig.dimension : null,
                metric: widgetConfig.metric
            }
        };

        const { error } = await supabase.rpc('update_widget_config_and_type', {
            p_widget_id: widget.id,
            p_widget_type: widget.type,
            p_config: updatedConfig
        });

        if (error) throw error;

        toast({ title: '¡Widget actualizado!', className: 'bg-green-100 text-green-800' });
        onWidgetUpdated(); // Usar el callback para actualizar el estado
        setIsOpen(false);

    } catch (error: any) {
      console.error("Error al actualizar el widget:", error); 
      toast({ title: 'Error al actualizar el widget', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConfig = (update: Partial<WidgetConfig>) => {
    setWidgetConfig(prev => prev ? { ...prev, ...update } : null);
  }

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="h-4 w-4 text-slate-600" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[70vh]">
        <DialogHeader>
            <DialogTitle>Editar Widget: {widgetConfig?.title || widget.title}</DialogTitle>
            <DialogDescription>Ajusta los detalles de tu widget.</DialogDescription>
        </DialogHeader>

        {widgetConfig && (
             <div className="grid grid-cols-5 gap-6 flex-grow h-full overflow-hidden py-4">
                <div className="col-span-2 flex flex-col space-y-4 overflow-y-auto pr-4 border-r">
                    <h3 className="text-lg font-semibold">Configuración</h3>
                    <div><Label>Título del Widget</Label><Input value={widgetConfig.title} onChange={(e) => updateConfig({ title: e.target.value })} /></div>
                    <TableSelector selectedTable={widgetConfig.dataSource} onTableSelect={(t) => updateConfig({ dataSource: t, dimension: null })} />
                    {widget.type !== 'kpi' && (
                    <ColumnSelector 
                        label="Agrupar por (Dimensión)"
                        dataSource={widgetConfig.dataSource}
                        selectedColumn={widgetConfig.dimension}
                        onColumnSelect={(c) => updateConfig({ dimension: c })}
                    />
                    )}
                    <div><Label>Medir (Métrica)</Label><Input value={widgetConfig.metric || ''} onChange={(e) => updateConfig({ metric: e.target.value })} placeholder="Ej: COUNT(*), AVG(columna)"/></div>
                </div>

                <div className="col-span-3 flex flex-col space-y-4 items-center justify-center bg-slate-50 rounded-lg p-4 h-full">
                    <h3 className="text-lg font-semibold self-start">Previsualización</h3>
                    <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center p-4">
                        <WidgetPreview widgetType={widget.type} previewData={previewData} title={widgetConfig.title}/>
                    </div>
                    <div className="w-full self-start pt-4">
                        <Label>Consulta SQL Generada</Label>
                        <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto"><code>{generatedQuery || '-- La consulta aparecerá aquí --'}</code></pre>
                    </div>
                </div>
            </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !generatedQuery}>{isSubmitting ? 'Guardando...' : 'Guardar Cambios'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
