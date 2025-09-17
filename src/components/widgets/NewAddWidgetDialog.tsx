
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, BarChart as BarChartIcon, TrendingUp, Table } from 'lucide-react';
import { Tables } from '@/types/supabase';
import DataTableConfig from './config/DataTableConfig';
import { DataTableWidget } from './DataTableWidget';
import KpiConfig from './config/KpiConfig';
import { KpiWidget } from './KpiWidget';
import BarChartConfig from './config/BarChartConfig';
import { BarChartWidget } from './BarChartWidget';

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface WidgetOption { type: string; name: string; description: string; icon: React.ElementType; }
const WIDGET_OPTIONS: WidgetOption[] = [
  { type: 'kpi', name: 'KPI', description: 'Muestra una métrica clave', icon: TrendingUp },
  { type: 'bar_chart', name: 'Gráfico de Barras', description: 'Compara valores entre categorías', icon: BarChartIcon },
  { type: 'data_table', name: 'Tabla de Datos', description: 'Muestra datos en formato tabular', icon: Table },
];
const DEFAULT_LAYOUT = { x: 0, y: 0, w: 6, h: 4 };

export const NewAddWidgetDialog = (props: any) => {
  const { dashboardId, onSave, open, onOpenChange, widgetToEdit } = props;
  const [step, setStep] = useState(0);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [widgetConfig, setWidgetConfig] = useState<any>({});

  const isEditMode = !!widgetToEdit;

  useEffect(() => {
    if (open && widgetToEdit) {
      setSelectedWidgetType(widgetToEdit.widget_type);
      setWidgetConfig(widgetToEdit.config as any);
      setStep(1);
    } else if (!open) {
      setTimeout(() => {
        setStep(0);
        setSelectedWidgetType(null);
        setWidgetConfig({});
      }, 200);
    }
  }, [open, widgetToEdit]);

  const handleSelectType = (type: string) => {
    setSelectedWidgetType(type);
    setWidgetConfig({ name: '' });
    setStep(1);
  };

  const handleBack = () => setStep(0);

  const handleSave = async () => {
     setIsSaving(true);
    try {
      if (isEditMode && widgetToEdit) {
        const { error } = await supabase.rpc('update_widget_config', { p_widget_id: widgetToEdit.id, p_widget_type: selectedWidgetType, p_config: widgetConfig });
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Widget actualizado correctamente.' });
      } else {
        const layout = selectedWidgetType === 'kpi' ? { x: 0, y: 0, w: 4, h: 2 } : DEFAULT_LAYOUT;
        const { error } = await supabase.rpc('create_widget', {
          p_dashboard_id: dashboardId,
          p_widget_type: selectedWidgetType,
          p_config: widgetConfig,
          p_layout: layout,
        });
        if (error) throw error;
        toast({ title: 'Éxito', description: 'Widget añadido correctamente.' });
      }
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast({ title: 'Error', description: `No se pudo guardar: ${error.message}`, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleConfigChange = useCallback((newValues: any) => {
    setWidgetConfig(currentConfig => {
        const newConfig = { ...currentConfig, ...newValues };
        let query = null;

        if (selectedWidgetType === 'data_table' && newConfig.tables?.length > 0 && newConfig.columns?.length > 0) {
            const allColumns = newConfig.columns;
            const subqueries = newConfig.tables.map((table: string) => {
                const [schema, tableName] = table.split('.');
                const selectClauses = allColumns.map((col: string) => {
                    const [colTable, colName] = col.split('.');
                    return tableName === colTable 
                        ? `"${colName}" AS "${col}"` 
                        : `NULL AS "${col}"`;
                });
                return `SELECT ${selectClauses.join(', ')} FROM "${schema}"."${tableName}"`;
            });
            query = subqueries.join(' UNION ALL ');
        } else if (selectedWidgetType === 'kpi' && newConfig.tables?.length > 0 && newConfig.aggregation && newConfig.column) {
            if (newConfig.column === '*') {
                const subqueries = newConfig.tables.map((table: string) => `SELECT COUNT(*) as value FROM ${table.replace('.', '.')}`);
                query = `SELECT SUM(value) as value FROM (${subqueries.join(' UNION ALL ')}) as subquery`;
            } else {
                const { column, aggregation } = newConfig;
                const subqueries = newConfig.tables.map((table: string) => {
                    const [schema, tableName] = table.split('.');
                    const [colTable, colName] = column.split('.');
                    if (tableName === colTable) {
                        return `SELECT "${colName}" AS value FROM "${schema}"."${tableName}"`;
                    }
                    return null;
                }).filter(Boolean);
                if(subqueries.length > 0) {
                    query = `SELECT ${aggregation.toUpperCase()}(value) as value FROM (${subqueries.join(' UNION ALL ')}) as subquery`;
                }
            }
        } else if (selectedWidgetType === 'bar_chart' && newConfig.tables?.length > 0 && newConfig.xAxis && newConfig.yAxis && newConfig.aggregation) {
            const { xAxis, yAxis, aggregation } = newConfig;
            const subqueries = newConfig.tables.map((table: string) => {
                const [schema, tableName] = table.split('.');
                const [xAxisTable, xAxisName] = xAxis.split('.');
                const selectX = tableName === xAxisTable ? `"${xAxisName}"` : `NULL`;

                let selectY;
                if (yAxis === '*') {
                    selectY = `1`;
                } else {
                    const [yAxisTable, yAxisName] = yAxis.split('.');
                    selectY = tableName === yAxisTable ? `"${yAxisName}"` : `NULL`;
                }
                
                return `SELECT ${selectX} AS "${xAxis}", ${selectY} AS "${yAxis}" FROM "${schema}"."${tableName}"`;
            });
            const yAxisFinal = yAxis === '*' ? `COUNT(*)` : `${aggregation.toUpperCase()}("${yAxis}")`;
            query = `SELECT "${xAxis}", ${yAxisFinal} as value FROM (${subqueries.join(' UNION ALL ')}) as subquery GROUP BY "${xAxis}"`;
        }
        
        return { ...newConfig, query };
    });
  }, [selectedWidgetType]);
  
  const renderStepContent = () => {
    if (step === 0) return <WidgetTypeSelector onSelect={handleSelectType} />;
    if (step === 1) {
      switch (selectedWidgetType) {
        case 'data_table': return <DataTableConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        case 'kpi': return <KpiConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        case 'bar_chart': return <BarChartConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        default: return <div className="text-center p-8"><p>Configurador no disponible.</p></div>;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>{isEditMode ? 'Editar Widget' : 'Añadir Nuevo Widget'}</DialogTitle></DialogHeader>
        <div className="flex-grow overflow-hidden">
          {step > 0 && !isEditMode && <Button variant="ghost" onClick={handleBack} className="mb-2"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>}
          <div className="h-full overflow-y-auto px-1">{renderStepContent()}</div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {step === 1 && <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ... (Config screens and previews remain the same, but now receive the centralized handleConfigChange)
const DataTableConfigScreen = ({ config, onConfigChange }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        <div className="md:col-span-4 space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">Configurar Tabla de Datos</h3>
            <div className="space-y-2">
                <Label>Nombre del Widget</Label>
                <Input value={config.name || ''} onChange={(e) => onConfigChange({ name: e.target.value })}/>
            </div>
            <DataTableConfig config={config} onChange={onConfigChange} />
        </div>
        <div className="md:col-span-8 space-y-6 flex flex-col">
            <h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3>
            <div className="p-4 bg-slate-50 rounded-lg flex-grow">
                <DataTableWidget widget={{ config }} isPreview={true} />
            </div>
        </div>
    </div>
);

const KpiConfigScreen = ({ config, onConfigChange }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        <div className="md:col-span-4 space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">Configurar KPI</h3>
            <div className="space-y-2">
                <Label>Nombre del Widget</Label>
                <Input value={config.name || ''} onChange={(e) => onConfigChange({ name: e.target.value })}/>
            </div>
            <KpiConfig config={config} onChange={onConfigChange} />
        </div>
        <div className="md:col-span-8 space-y-6 flex flex-col">
            <h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3>
            <div className="p-4 bg-slate-50 rounded-lg flex-grow">
                <KpiWidget widget={{ config }} />
            </div>
        </div>
    </div>
);

const BarChartConfigScreen = ({ config, onConfigChange }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        <div className="md:col-span-4 space-y-6">
            <h3 className="font-semibold text-lg border-b pb-2">Configurar Gráfico de Barras</h3>
            <div className="space-y-2">
                <Label>Nombre del Widget</Label>
                <Input value={config.name || ''} onChange={(e) => onConfigChange({ name: e.target.value })}/>
            </div>
            <BarChartConfig config={config} onChange={onConfigChange} />
        </div>
        <div className="md:col-span-8 space-y-6 flex flex-col">
            <h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3>
            <div className="p-4 bg-slate-50 rounded-lg flex-grow">
                <BarChartWidget widget={{ config }} />
            </div>
        </div>
    </div>
);

const WidgetTypeSelector = ({ onSelect }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4">
    {WIDGET_OPTIONS.map((widget) => (
        <button key={widget.type} onClick={() => onSelect(widget.type)} className="p-6 border rounded-lg hover:bg-slate-50 hover:shadow-md transition-all text-center flex flex-col items-center gap-3 h-full justify-center">
          <widget.icon className="h-8 w-8 text-slate-700" />
          <h3 className="font-semibold text-lg mt-2">{widget.name}</h3>
          <p className="text-sm text-slate-500 text-center">{widget.description}</p>
        </button>
    ))}
  </div>
);