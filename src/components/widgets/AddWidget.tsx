
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";
import { PlusCircle } from 'lucide-react';
import { Widget } from './Widget'; 
import { TableSelector } from './TableSelector'; 
import { ColumnSelector } from './ColumnSelector';

interface WidgetConfig {
  title: string;
  type: 'kpi' | 'table' | 'bar_chart' | 'line_chart';
  dataSource: string | null;  
  dimension: string | null;   
  metric: string | null;      
}

interface PreviewData {
  [key: string]: any;
}

export function AddWidget({ dashboardId, onWidgetAdded }: { dashboardId: string, onWidgetAdded: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>({
    title: 'Nuevo Widget',
    type: 'kpi',
    dataSource: null,
    dimension: null, 
    metric: 'COUNT(*)',
  });

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [generatedQuery, setGeneratedQuery] = useState('');

  useEffect(() => {
    const buildAndFetch = async () => {
      if (!widgetConfig.dataSource || !widgetConfig.metric) {
        setGeneratedQuery('');
        setPreviewData(null);
        return;
      }

      const dimensionSelect = widgetConfig.dimension ? `\"${widgetConfig.dimension}\",` : '';
      const groupBy = widgetConfig.dimension ? `GROUP BY \"${widgetConfig.dimension}\"` : '';
      const query = `SELECT ${dimensionSelect} ${widgetConfig.metric} as metric FROM be_exponential.${widgetConfig.dataSource} ${groupBy} ORDER BY metric DESC LIMIT 10`;
      setGeneratedQuery(query);

      const handler = setTimeout(async () => {
        // *** CORRECCIÓN DEFINITIVA ***: Usando `p_query` para que coincida con la migración final.
        const { data, error } = await supabase.rpc('execute_query', { p_query: query });
        if (error) {
          console.error("Preview error:", error);
          setPreviewData([{ error: 'Error al cargar previsualización: ' + error.message }]);
        } else {
          setPreviewData(data);
        }
      }, 500);
      return () => clearTimeout(handler);
    };

    buildAndFetch();
  }, [widgetConfig]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
        const { error } = await supabase.from('report_widgets').insert([{
            dashboard_id: dashboardId,
            widget_type: widgetConfig.type,
            config: {
                title: widgetConfig.title,
                query: generatedQuery,
                options: { dimension: widgetConfig.dimension, metric: widgetConfig.metric }
            },
            layout: { x: 0, y: 0, w: 2, h: 2 } 
        }]);
        if (error) throw error;
        toast({ title: '¡Widget añadido!', className: 'bg-green-100 text-green-800' });
        onWidgetAdded();
        setIsOpen(false);
    } catch (error: any) {
        toast({ title: 'Error al añadir el widget', description: error.message, variant: 'destructive' });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" />Añadir Widget</Button></DialogTrigger>
      <DialogContent className="max-w-6xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>Crear un nuevo widget</DialogTitle>
          <DialogDescription>Configura y previsualiza tu widget antes de guardarlo.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-8 flex-grow h-full overflow-hidden">
          
          <div className="col-span-2 flex flex-col space-y-4 overflow-y-auto pr-4 border-r">
            <h3 className="text-lg font-semibold">Configuración</h3>
            <div><Label>Título del Widget</Label><Input value={widgetConfig.title} onChange={(e) => setWidgetConfig({ ...widgetConfig, title: e.target.value })} /></div>
            <div><Label>Tipo de Widget</Label>
              <Select value={widgetConfig.type} onValueChange={(v: any) => setWidgetConfig({ ...widgetConfig, type: v })}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="kpi">KPI</SelectItem>
                  <SelectItem value="table">Tabla</SelectItem>
                  <SelectItem value="bar_chart">Gráfico de Barras</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TableSelector selectedTable={widgetConfig.dataSource} onTableSelect={(t) => setWidgetConfig({ ...widgetConfig, dataSource: t, dimension: null })} />
            
            <ColumnSelector 
              label="Agrupar por (Dimensión)"
              dataSource={widgetConfig.dataSource}
              selectedColumn={widgetConfig.dimension}
              onColumnSelect={(c) => setWidgetConfig({ ...widgetConfig, dimension: c })}
            />

             <div><Label>Medir (Métrica)</Label>
              <Select value={widgetConfig.metric || undefined} onValueChange={(m) => setWidgetConfig({ ...widgetConfig, metric: m })}>
                <SelectTrigger><SelectValue placeholder="Selecciona una métrica" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="COUNT(*)">Contar Filas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-3 flex flex-col space-y-4 items-center justify-center bg-slate-50 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold self-start">Previsualización</h3>
            <div className="w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center p-4">
                <Widget data={{
                  title: widgetConfig.title,
                  type: widgetConfig.type,
                  previewData: previewData,
                  query: generatedQuery, 
                  options: {}
                }} />
            </div>
             <div className="w-full self-start pt-4">
                <Label>Consulta SQL Generada</Label>
                <pre className="text-xs bg-gray-100 p-2 rounded-md overflow-x-auto"><code>{generatedQuery || '-- La consulta aparecerá aquí --'}</code></pre>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !generatedQuery}>
            {isSubmitting ? 'Guardando...' : 'Guardar Widget'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
