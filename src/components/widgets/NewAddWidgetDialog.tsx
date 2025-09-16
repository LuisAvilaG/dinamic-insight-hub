
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart, Table, LineChart, PieChart, ArrowLeft, Loader2, Rows } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tables } from '@/types/supabase';

// Importaciones para el nuevo widget
import AdvancedTableConfig from './config/AdvancedTableConfig';
import AdvancedTableWidget from './AdvancedTableWidget'; // Importamos el widget para la preview

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface WidgetOption { type: string; name: string; description: string; icon: React.ElementType; }
interface NewAddWidgetDialogProps {
  dashboardId: string;
  onSave: () => void; 
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetToEdit?: Widget | null;
}

type SchemaTable = { table_schema: string; table_name: string; };

const WIDGET_OPTIONS: WidgetOption[] = [
  { type: 'kpi', name: 'KPI', description: 'Muestra una métrica clave', icon: TrendingUp },
  { type: 'table', name: 'Tabla de Datos', description: 'Muestra datos en formato tabular', icon: Table },
  { type: 'bar_chart', name: 'Gráfico de Barras', description: 'Compara valores entre categorías', icon: BarChart },
  { type: 'line_chart', name: 'Gráfico de Líneas', description: 'Muestra tendencias en el tiempo', icon: LineChart },
  { type: 'donut_chart', name: 'Gráfico de Dona', description: 'Muestra proporciones de un todo', icon: PieChart },
  // Añadimos el nuevo widget a la lista de opciones
  { type: 'advanced_table', name: 'Tabla Avanzada', description: 'Tabla de datos con orden y filtro', icon: Rows },
];
const DEFAULT_LAYOUT = { x: 0, y: 0, w: 6, h: 4 };

export const NewAddWidgetDialog = (props: NewAddWidgetDialogProps) => {
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
            // Ajustamos el layout por defecto para la tabla avanzada
            const layout = selectedWidgetType === 'advanced_table' ? { x: 0, y: 0, w: 12, h: 6 } : (selectedWidgetType === 'kpi' ? { x: 0, y: 0, w: 4, h: 2 } : DEFAULT_LAYOUT);
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

  const renderStepContent = () => {
    if (step === 0) return <WidgetTypeSelector onSelect={handleSelectType} />;
    if (step === 1) {
      switch(selectedWidgetType) {
        case 'kpi': return <KpiConfigScreen config={widgetConfig} onConfigChange={setWidgetConfig} />;
        case 'bar_chart': return <BarChartConfigScreen config={widgetConfig} onConfigChange={setWidgetConfig} />;
        // Añadimos el caso para renderizar la configuración de la tabla avanzada
        case 'advanced_table': return <AdvancedTableConfigScreen config={widgetConfig} onConfigChange={setWidgetConfig} />;
        default: return <div className="text-center p-8"><p>Configurador no disponible.</p></div>;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>{isEditMode ? 'Editar Widget' : 'Añadir Nuevo Widget'}</DialogTitle></DialogHeader>
        <div className="flex-grow overflow-hidden">
          {step > 0 && !isEditMode && <Button variant="ghost" onClick={handleBack} className="mb-2"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>}
          <div className="h-full overflow-y-auto px-1">{renderStepContent()}</div>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {step === 1 && <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>}
        </DialogFooter>
    </DialogContent></Dialog>
  );
};

// --- Componente de Configuración y Vista Previa para la Tabla Avanzada ---
const AdvancedTableConfigScreen = ({ config, onConfigChange }: { config: any; onConfigChange: (c: any) => void }) => {
    const handleMainConfigChange = (newConfig: { schema: string; table: string; columns: string[] }) => {
        onConfigChange({ ...config, ...newConfig });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Configurar Tabla Avanzada</h3>
                <div className="space-y-2">
                    <Label>Nombre del Widget</Label>
                    <Input 
                        value={config.name || ''} 
                        onChange={(e) => onConfigChange({ ...config, name: e.target.value })} 
                        placeholder="Ej: Usuarios Activos"
                    />
                </div>
                <AdvancedTableConfig 
                    initialConfig={{ schema: config.schema, table: config.table, columns: config.columns }}
                    onChange={handleMainConfigChange}
                />
            </div>
            <div className="space-y-6">
                <h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3>
                <div className="p-4 bg-slate-50 rounded-lg h-full flex items-center justify-center">
                    <AdvancedTablePreview config={config} />
                </div>
            </div>
        </div>
    );
};

const AdvancedTablePreview = ({ config }: { config: any }) => {
    const { name, schema, table, columns } = config;
    const isConfigComplete = schema && table && columns && columns.length > 0;

    return (
        <Card className="w-full h-full flex flex-col">
            <CardHeader>
                <CardTitle className="truncate">{name || "Nombre del Widget"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
                {!isConfigComplete ? (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-400 text-center">Completa la configuración para ver la vista previa.</p>
                    </div>
                ) : (
                    <AdvancedTableWidget config={{ schema, table, columns }} />
                )}
            </CardContent>
        </Card>
    );
};


// Mantenemos los componentes existentes sin cambios
const useSchemaInfo = (config: any) => {
  const [tables, setTables] = useState<SchemaTable[]>([]);
  const [columns, setColumns] = useState<{ column_name: string; data_type: string }[]>([]);
  useEffect(() => { supabase.rpc('get_schema_tables').then(({ data }) => data && setTables(data)); }, []);
  useEffect(() => {
    if (config.schema && config.table) {
      supabase.rpc('get_table_columns', { p_schema_name: config.schema, p_table_name: config.table }).then(({ data }) => data && setColumns(data));
    } else { setColumns([]); }
  }, [config.schema, config.table]);
  const numericColumns = columns.filter(c => ['integer', 'bigint', 'numeric', 'real', 'double precision', 'smallint'].includes(c.data_type));
  return { tables, columns, numericColumns };
};

const KpiConfigScreen = ({ config, onConfigChange }: { config: any; onConfigChange: (c: any) => void }) => {
  const { tables, columns, numericColumns } = useSchemaInfo(config);
  const isCount = config.aggregation === 'count';
  const columnsForDropdown = isCount ? columns : numericColumns;

  const handleTableChange = (value: string) => {
    const [schema, table] = JSON.parse(value);
    onConfigChange({ ...config, schema, table, column: null, aggregation: null });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <div className="space-y-6">
        <h3 className="font-semibold text-lg border-b pb-2">Configurar KPI</h3>
        <div className="space-y-2"><Label>Nombre</Label><Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })} placeholder="Ej: Ingresos Totales"/></div>
        <div className="space-y-2"><Label>Tabla</Label><Select value={config.table ? JSON.stringify([config.schema, config.table]) : ""} onValueChange={handleTableChange}><SelectTrigger><SelectValue placeholder="Selecciona tabla..." /></SelectTrigger><SelectContent>{tables.map(t => <SelectItem key={`${t.table_schema}.${t.table_name}`} value={JSON.stringify([t.table_schema, t.table_name])}>{t.table_schema}.{t.table_name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>Agregación</Label><Select value={config.aggregation} onValueChange={val => onConfigChange({ ...config, aggregation: val, column: null })} disabled={!config.table}><SelectTrigger><SelectValue placeholder="Selecciona agregación..." /></SelectTrigger><SelectContent><SelectItem value="sum">Suma</SelectItem><SelectItem value="avg">Promedio</SelectItem><SelectItem value="count">Recuento</SelectItem><SelectItem value="min">Mínimo</SelectItem><SelectItem value="max">Máximo</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>{isCount ? 'Columna' : 'Columna Numérica'}</Label><Select value={config.column} onValueChange={val => onConfigChange({ ...config, column: val })} disabled={!config.aggregation}><SelectTrigger><SelectValue placeholder="Selecciona columna..." /></SelectTrigger><SelectContent>{isCount && <SelectItem value="*">* (Contar filas)</SelectItem>}{columnsForDropdown.map(c => <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-6"><h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3><div className="p-4 bg-slate-50 rounded-lg h-full flex items-center justify-center"><KpiPreview config={config} /></div></div>
    </div>
  );
};

const KpiPreview = ({ config }: { config: any }) => {
    const { name, schema, table, column, aggregation } = config;
    const [result, setResult] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const isConfigComplete = schema && table && column && aggregation;
    
    useEffect(() => {
        if (!isConfigComplete) { setResult(null); return; }
        const runQuery = async () => {
            setIsLoading(true);
            const columnExpression = column === '*' ? '*' : `\"${column}\"`;
            const query = `SELECT ${aggregation}(${columnExpression}) as value FROM \"${schema}\".\"${table}\"`;
            try {
                const { data, error } = await supabase.rpc('execute_query', { p_query: query });
                if (error) throw error;
                setResult(data && data.length > 0 ? data[0].value : 0);
            } catch (err: any) { setResult(null); console.error("Error en vista previa de KPI:", err.message); }
            setIsLoading(false);
        };
        const t = setTimeout(runQuery, 500);
        return () => clearTimeout(t);
    }, [name, schema, table, column, aggregation]);

    return (
        <Card className="w-full"><CardHeader><CardTitle className="truncate">{name || "Nombre"}</CardTitle></CardHeader><CardContent className="text-center">
            {isLoading ? <Loader2 className="h-10 w-10 mx-auto animate-spin text-slate-400" /> : !isConfigComplete ? <p className="text-slate-400">Completa la config.</p> : <p className="text-4xl font-bold">{result !== null ? new Intl.NumberFormat().format(result) : 'Error'}</p>}
        </CardContent></Card>
    );
}

const BarChartConfigScreen = ({ config, onConfigChange }: { config: any; onConfigChange: (c: any) => void }) => {
    const { tables, columns, numericColumns } = useSchemaInfo(config);
    const isCount = config.aggregation === 'count';
    const columnsForYAxis = isCount ? columns : numericColumns;

    const handleTableChange = (value: string) => {
        const [schema, table] = JSON.parse(value);
        onConfigChange({ ...config, schema, table, xAxis: null, yAxis: null, aggregation: null });
    };

    const handleAggregationChange = (value: string) => {
        onConfigChange({ ...config, aggregation: value, yAxis: null });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Config. Gráfico de Barras</h3>
                <div className="space-y-2"><Label>Nombre</Label><Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })} placeholder="Ej: Ventas por Producto"/></div>
                <div className="space-y-2"><Label>Tabla</Label><Select value={config.table ? JSON.stringify([config.schema, config.table]) : ""} onValueChange={handleTableChange}><SelectTrigger><SelectValue placeholder="Selecciona tabla..." /></SelectTrigger><SelectContent>{tables.map(t => <SelectItem key={`${t.table_schema}.${t.table_name}`} value={JSON.stringify([t.table_schema, t.table_name])}>{t.table_schema}.{t.table_name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Eje X (Categoría)</Label><Select value={config.xAxis} onValueChange={val => onConfigChange({ ...config, xAxis: val })} disabled={!config.table}><SelectTrigger><SelectValue placeholder="Selecciona columna..." /></SelectTrigger><SelectContent>{columns.map(c => <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Agregación (Eje Y)</Label><Select value={config.aggregation} onValueChange={handleAggregationChange} disabled={!config.table}><SelectTrigger><SelectValue placeholder="Selecciona agregación..." /></SelectTrigger><SelectContent><SelectItem value="sum">Suma</SelectItem><SelectItem value="avg">Promedio</SelectItem><SelectItem value="count">Recuento</SelectItem></SelectContent></Select></div>
                <div className="space-y-2"><Label>{isCount ? 'Columna del Eje Y' : 'Columna Numérica del Eje Y'}</Label><Select value={config.yAxis} onValueChange={val => onConfigChange({ ...config, yAxis: val })} disabled={!config.aggregation}><SelectTrigger><SelectValue placeholder="Selecciona columna..." /></SelectTrigger><SelectContent>{isCount && <SelectItem value="*">* (Contar filas)</SelectItem>}{columnsForYAxis.map(c => <SelectItem key={c.column_name} value={c.column_name}>{c.column_name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-6"><h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3><div className="p-4 bg-slate-50 rounded-lg h-full flex items-center justify-center"><BarChartPreview config={config} /></div></div>
        </div>
    );
};

const BarChartPreview = ({ config }: { config: any }) => {
    const { name, schema, table, xAxis, yAxis, aggregation } = config;
    const [chartData, setChartData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const isConfigComplete = schema && table && xAxis && yAxis && aggregation;
    useEffect(() => {
        if (!isConfigComplete) {
          setChartData([]);
          return;
        }
        const runQuery = async () => {
            setIsLoading(true);
            const yAxisExpression = yAxis === '*' ? '*' : `\"${yAxis}\"`;
            const query = `SELECT \"${xAxis}\", ${aggregation}(${yAxisExpression}) as value FROM \"${schema}\".\"${table}\" GROUP BY \"${xAxis}\"`;
            try {
              const { data, error } = await supabase.rpc('execute_query', { p_query: query });
              if (error) throw error;
              setChartData(data || []);
            } catch (err: any) { setChartData([]); console.error("Error en vista previa de gráfico:", err.message); }
            setIsLoading(false);
        };
        const t = setTimeout(runQuery, 500);
        return () => clearTimeout(t);
    }, [name, schema, table, xAxis, yAxis, aggregation]);
    return (
        <Card className="w-full h-full flex flex-col"><CardHeader><CardTitle className="truncate">{name || "Nombre"}</CardTitle></CardHeader><CardContent className="flex-grow">
            {isLoading ? <Loader2 className="h-10 w-10 mx-auto animate-spin text-slate-400" /> : !isConfigComplete ? <p className="text-slate-400 text-center">Completa la config.</p> : 
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey={xAxis} tick={{ fontSize: 12 }} /><YAxis tickFormatter={(v) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(v)} /><Tooltip formatter={(v) => new Intl.NumberFormat().format(v as number)} /><Legend /><Bar dataKey="value" fill="#3b82f6" name={yAxis === '*' ? 'Total' : yAxis || 'Valor'} />
                </RechartsBarChart>
            </ResponsiveContainer>}
        </CardContent></Card>
    );
};

const WidgetTypeSelector = ({ onSelect }: { onSelect: (type: string) => void }) => (
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
