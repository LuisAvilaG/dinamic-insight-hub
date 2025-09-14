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
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle, ArrowLeft, BarChart, Hash, Table, LineChart, PieChart } from 'lucide-react'; // Importado PieChart
import { TableSelector } from './TableSelector'; 
import { ColumnSelector } from './ColumnSelector';
import { WidgetPreview } from './WidgetPreview';
import { Tables } from '@/types/supabase';
import { Layout } from 'react-grid-layout';
import { Card } from '@/components/ui/card';

export type WidgetType = 'kpi' | 'table' | 'bar_chart' | 'line_chart' | 'donut_chart'; // Añadido donut_chart

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;


// --- METADATOS PARA LA GALERÍA DE WIDGETS ---
const widgetTemplates = [
  {
    type: 'kpi' as WidgetType,
    title: 'Métrica (KPI)',
    description: 'Muestra un valor numérico clave para un seguimiento rápido.',
    icon: <Hash className="w-12 h-12 text-blue-500" />,
    defaultSize: { w: 3, h: 2 },
  },
  {
    type: 'bar_chart' as WidgetType,
    title: 'Gráfico de Barras',
    description: 'Compara valores entre diferentes categorías.',
    icon: <BarChart className="w-12 h-12 text-orange-500" />,
    defaultSize: { w: 4, h: 3 },
  },
  {
    type: 'line_chart' as WidgetType,
    title: 'Gráfico de Líneas',
    description: 'Muestra tendencias y la evolución de datos a lo largo del tiempo.',
    icon: <LineChart className="w-12 h-12 text-teal-500" />,
    defaultSize: { w: 4, h: 3 },
  },
  {
    type: 'donut_chart' as WidgetType, // Nueva plantilla
    title: 'Gráfico de Dona',
    description: 'Muestra la proporción de categorías en un total.',
    icon: <PieChart className="w-12 h-12 text-violet-500" />,
    defaultSize: { w: 3, h: 3 },
  },
  {
    type: 'table' as WidgetType,
    title: 'Tabla de Datos',
    description: 'Visualiza tus datos en un formato de filas y columnas.',
    icon: <Table className="w-12 h-12 text-green-500" />,
    defaultSize: { w: 6, h: 4 },
  },
];

// --- INTERFACES Y TIPOS ---
interface WidgetConfig {
  title: string;
  type: WidgetType;
  dataSource: string | null;
  dimension: string | null;
  metric: string | null;
}

interface PreviewData {
  [key: string]: any;
}

// --- FUNCIÓN DE POSICIONAMIENTO MEJORADA ---
const findNextAvailablePosition = (existingWidgets: Widget[], newWidget: {w: number, h: number}, cols: number): {x: number, y: number} => {
  const grid: boolean[][] = Array(100).fill(0).map(() => Array(cols).fill(false));

  existingWidgets.forEach(widget => {
    const layout = widget.layout as (Layout | undefined);
    if (layout && typeof layout.x === 'number' && typeof layout.y === 'number' && typeof layout.w === 'number' && typeof layout.h === 'number') {
      for (let y = layout.y; y < layout.y + layout.h; y++) {
        for (let x = layout.x; x < layout.x + layout.w; x++) {
          if (y < grid.length && x < grid[0].length) {
            grid[y][x] = true;
          }
        }
      }
    }
  });

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x <= cols - newWidget.w; x++) {
      let canPlace = true;
      for (let h_offset = 0; h_offset < newWidget.h; h_offset++) {
        for (let w_offset = 0; w_offset < newWidget.w; w_offset++) {
            if (y + h_offset >= grid.length || x + w_offset >= cols || grid[y + h_offset][x + w_offset]) {
                canPlace = false;
                break;
            }
        }
        if (!canPlace) break;
      }

      if (canPlace) {
        return { x, y };
      }
    }
  }

  return { x: 0, y: Infinity };
};


// --- COMPONENTE PRINCIPAL ---
export function AddWidget({ dashboardId, onWidgetAdded, widgets }: { dashboardId: string, onWidgetAdded: () => void, widgets: Widget[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [step, setStep] = useState('selection');
  const [selectedTemplate, setSelectedTemplate] = useState<typeof widgetTemplates[0] | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);

  const [previewData, setPreviewData] = useState<PreviewData[] | null>(null);
  const [generatedQuery, setGeneratedQuery] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep('selection');
      setSelectedTemplate(null);
      setWidgetConfig(null);
      setPreviewData(null);
      setGeneratedQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'configuration' || !widgetConfig) return;

    const buildAndFetch = async () => {
      if (!widgetConfig.dataSource || !widgetConfig.metric) {
        setGeneratedQuery('');
        setPreviewData(null);
        return;
      }

      const hasDimension = widgetConfig.type !== 'kpi' && widgetConfig.dimension;
      const dimensionSelect = hasDimension ? `\"${widgetConfig.dimension}\",` : '';
      const groupBy = hasDimension ? `GROUP BY \"${widgetConfig.dimension}\"` : '';
      const query = `SELECT ${dimensionSelect} ${widgetConfig.metric} as metric FROM be_exponential.${widgetConfig.dataSource} ${groupBy} ORDER BY metric DESC LIMIT 10`;
      
      setGeneratedQuery(query);

      const handler = setTimeout(async () => {
        const { data, error } = await supabase.rpc('execute_query', { p_query: query });
        if (error) {
          setPreviewData([{ error: 'Error al cargar previsualización: ' + error.message }]);
        } else {
          setPreviewData(data);
        }
      }, 500);
      return () => clearTimeout(handler);
    };

    buildAndFetch();
  }, [widgetConfig, step]);

  const handleTemplateSelect = (template: typeof widgetTemplates[0]) => {
    setSelectedTemplate(template);
    setWidgetConfig({
      title: template.title,
      type: template.type,
      dataSource: null,
      dimension: null,
      metric: 'COUNT(*)',
    });
    setStep('configuration');
  };

  const handleBack = () => {
    setStep('selection');
    setWidgetConfig(null);
    setSelectedTemplate(null);
    setPreviewData(null);
    setGeneratedQuery('');
  };

  const handleSubmit = async () => {
    if (!widgetConfig || !selectedTemplate) return;

    setIsSubmitting(true);
    const position = findNextAvailablePosition(widgets, selectedTemplate.defaultSize, 12);
    const newLayout = { ...selectedTemplate.defaultSize, ...position, i: `new-${Date.now()}` };

    try {
        const configParam = {
            title: widgetConfig.title,
            query: generatedQuery,
            options: {
                dataSource: widgetConfig.dataSource,
                dimension: widgetConfig.type !== 'kpi' ? widgetConfig.dimension : null,
                metric: widgetConfig.metric
            }
        };

        const { error } = await supabase.rpc('insert_widget', {
            p_dashboard_id: dashboardId,
            p_widget_type: widgetConfig.type,
            p_config: configParam,
            p_layout: { x: newLayout.x, y: newLayout.y, w: newLayout.w, h: newLayout.h }
        });

      if (error) throw error;

      toast({ title: '¡Widget añadido!', className: 'bg-green-100 text-green-800' });
      onWidgetAdded();
      setIsOpen(false);
    } catch (error: any) {
      console.error("Error al guardar el widget:", error); 
      toast({ title: 'Error al añadir el widget', description: error.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateConfig = (update: Partial<WidgetConfig>) => {
    setWidgetConfig(prev => prev ? { ...prev, ...update } : null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Widget</Button></DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh]">
        {step === 'selection' && (
          <>
            <DialogHeader>
              <DialogTitle>Añadir un nuevo widget</DialogTitle>
              <DialogDescription>Elige un tipo de widget de la galería para empezar a visualizar tus datos.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
              {widgetTemplates.map(template => (
                <Card key={template.type} className="flex flex-col items-center justify-center text-center p-6 hover:bg-muted/50 hover:shadow-lg transition-all cursor-pointer" onClick={() => handleTemplateSelect(template)}>
                   <div className="mb-4">{template.icon}</div>
                   <h3 className="font-semibold text-lg">{template.title}</h3>
                   <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            </DialogFooter>
          </>
        )}

        {step === 'configuration' && widgetConfig && (
          <>
            <DialogHeader>
               <div className="flex items-center space-x-4">
                <Button variant="outline" size="icon" onClick={handleBack}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <DialogTitle>Configurar: {selectedTemplate?.title}</DialogTitle>
                    <DialogDescription>Ajusta los detalles de tu widget.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-5 gap-8 flex-grow h-full overflow-hidden py-4">
              <div className="col-span-2 flex flex-col space-y-4 overflow-y-auto pr-4 border-r">
                <h3 className="text-lg font-semibold">Configuración</h3>
                <div><Label>Título del Widget</Label><Input value={widgetConfig.title} onChange={(e) => updateConfig({ title: e.target.value })} /></div>
                <TableSelector selectedTable={widgetConfig.dataSource} onTableSelect={(t) => updateConfig({ dataSource: t, dimension: null })} />
                {widgetConfig.type !== 'kpi' && (
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
                    <WidgetPreview widgetType={widgetConfig.type} previewData={previewData} title={widgetConfig.title}/>
                </div>
                <div className="w-full self-start pt-4">
                    <Label>Consulta SQL Generada</Label>
                    <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto"><code>{generatedQuery || '-- La consulta aparecerá aquí --'}</code></pre>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting || !generatedQuery}>{isSubmitting ? 'Guardando...' : 'Guardar Widget'}</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
