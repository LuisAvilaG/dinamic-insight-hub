
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, BarChart as BarChartIcon, TrendingUp, Table, Grid, LineChart as LineChartIcon } from 'lucide-react';
import { Tables } from '@/types/supabase';
import DataTableConfig from './config/DataTableConfig';
import { DataTableWidget } from './DataTableWidget';
import { KpiConfig } from './config/KpiConfig';
import { KpiWidget } from './KpiWidget';
import { BarChartConfig } from './config/BarChartConfig';
import { BarChartWidget } from './BarChartWidget';
import { PivotTableConfig } from './config/PivotTableConfig';
import { PivotTableWidget } from './PivotTableWidget';
import { LineChartConfig } from './config/LineChartConfig';
import { LineChartWidget } from './LineChartWidget';

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;
type CalculatedField = { name: string; expression: string; tables_used: string[] };

interface WidgetOption { type: string; name: string; description: string; icon: React.ElementType; }
const WIDGET_OPTIONS: WidgetOption[] = [
  { type: 'kpi', name: 'KPI', description: 'Muestra una métrica clave', icon: TrendingUp },
  { type: 'bar_chart', name: 'Gráfico de Barras', description: 'Compara valores', icon: BarChartIcon },
  { type: 'line_chart', name: 'Gráfico de Líneas', description: 'Muestra tendencias', icon: LineChartIcon },
  { type: 'data_table', name: 'Tabla de Datos', description: 'Muestra datos en formato plano', icon: Table },
  { type: 'pivot_table', name: 'Tabla Dinámica', description: 'Agrupa y resume datos', icon: Grid },
];
const DEFAULT_LAYOUT = { x: 0, y: 0, w: 6, h: 4 };

const getSourceTableFromColumn = (column: string): string | null => {
    if (!column || !column.includes('.')) return null;
    const parts = column.split('.');
    if (parts.length < 3) return null;
    return `"${parts[0]}"."${parts[1]}"`;
};

const getSimpleColumnName = (column: string) => {
    if (!column || column.trim() === '' || !column.includes('.')) return `"${column}"`;
    const parts = column.split('.');
    const colName = parts[parts.length - 1];
    return colName.trim() === '' ? '""' : `"${colName}"`;
};

const sanitizeExpression = (expression: string): string => {
    return expression.replace(/"?(\w+)"?\."?(\w+)"?\."?(\w+)"?/g, '"$3"');
};

const isAggregateExpression = (expression: string): boolean => {
    if (!expression) return false;
    const upperExpr = expression.toUpperCase();
    return upperExpr.includes('COUNT(') || upperExpr.includes('SUM(') || upperExpr.includes('AVG(') || upperExpr.includes('MIN(') || upperExpr.includes('MAX(');
};


export const NewAddWidgetDialog = (props: any) => {
  const { dashboardId, onSave, open, onOpenChange, widgetToEdit } = props;
  const [step, setStep] = useState(0);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [widgetConfig, setWidgetConfig] = useState<any>({});
  const [allCalculatedFields, setAllCalculatedFields] = useState<CalculatedField[]>([]);

  const isEditMode = !!widgetToEdit;

  useEffect(() => {
    if (open) {
        supabase.rpc('get_calculated_fields').then(({ data }) => {
            if (data) setAllCalculatedFields(data);
        });
    }

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

        if (selectedWidgetType === 'bar_chart' || selectedWidgetType === 'line_chart') {
            const { xAxis, yAxis, aggregation } = newConfig;
            if (!xAxis || !yAxis) return { ...newConfig, query: null };
            const yAxisField = allCalculatedFields.find(f => f.name === yAxis);
            if (!yAxisField && !aggregation) return { ...newConfig, query: null };
            const sourceTable = getSourceTableFromColumn(xAxis);
            if (!sourceTable) return { ...newConfig, query: null };
            const simpleXAxis = getSimpleColumnName(xAxis);
            const yAxisExpression = yAxisField ? `(${sanitizeExpression(yAxisField.expression)})` : `${aggregation.toUpperCase()}(${getSimpleNameColumnName(yAxis)})`;
            let baseQuery = `SELECT ${simpleXAxis} as "Eje X", ${yAxisExpression} as "Eje Y" FROM ${sourceTable} GROUP BY ${simpleXAxis}`;
            if (selectedWidgetType === 'line_chart') baseQuery += ` ORDER BY ${simpleXAxis}`;
            query = baseQuery;
        } else if (selectedWidgetType === 'data_table' && newConfig.tables?.length > 0 && newConfig.columns?.length > 0) {
            const { tables, columns } = newConfig;
            const subqueries = tables.map((table: string) => {
                const [schema, tableName] = table.split('.');
                const selectClauses = columns.map((col: string) => {
                    const calcField = allCalculatedFields.find(f => f.name === col);
                    if(calcField) return `(${sanitizeExpression(calcField.expression)}) AS "${col}"`;
                    const colParts = col.split('.');
                    return `"${tableName}"."${colParts[colParts.length-1]}"` === `"${tableName}"."${col.split('.')[col.split('.').length-1]}"` ? `"${colParts[colParts.length-1]}" AS "${col}"` : `NULL AS "${col}"`;
                });
                return `SELECT ${selectClauses.join(', ')} FROM "${schema}"."${tableName}"`;
            });
            query = subqueries.join(' UNION ALL ');
        } else if (selectedWidgetType === 'kpi' && newConfig.tables?.length > 0 && newConfig.column) {
            const { tables, column, aggregation } = newConfig;
            const columnField = allCalculatedFields.find(f => f.name === column);
            if (columnField) {
                const sourceTable = columnField.tables_used[0];
                query = `SELECT (${sanitizeExpression(columnField.expression)}) as value FROM ${sourceTable}`;
            } else if (column === '*') {
                const subqueries = tables.map((table: string) => `SELECT COUNT(*) as value FROM ${table}`);
                query = `SELECT SUM(value) as value FROM (${subqueries.join(' UNION ALL ')}) as subquery`;
            } else if (aggregation) {
                const subqueries = tables.map((table: string) => `SELECT ${getSimpleNameColumnName(column)} AS value FROM ${table}`);
                query = `SELECT ${aggregation.toUpperCase()}(value) as value FROM (${subqueries.join(' UNION ALL ')}) as subquery`;
            }
        } else if (selectedWidgetType === 'pivot_table') {
            const { tables, rows, columns, measures } = newConfig;
            const isConfigComplete = tables?.[0] && (rows?.length > 0 || columns?.length > 0) && measures?.length > 0 && measures.every((m) => m.column && m.column.trim() !== '');
            if (!isConfigComplete) {
                return { ...newConfig, query: null };
            }
            const sourceTable = tables[0];
            const groupByFields = [...(rows || []), ...(columns || [])];
            const selectClauses = [];
            const groupByOrdinals = [];
            groupByFields.forEach((field, index) => {
                const calcField = allCalculatedFields.find(f => f.name === field);
                if (calcField) {
                    selectClauses.push(`(${sanitizeExpression(calcField.expression)}) AS "${field}"`);
                } else {
                    selectClauses.push(`${getSimpleNameColumnName(field)} AS ${getSimpleNameColumnName(field)}`);
                }
                groupByOrdinals.push(index + 1);
            });
            measures.forEach((measure) => {
                const calcField = allCalculatedFields.find(f => f.name === measure.column);
                if (calcField && isAggregateExpression(calcField.expression)) {
                     selectClauses.push(`(${sanitizeExpression(calcField.expression)}) AS "${measure.column}"`);
                } else if (measure.aggregation) {
                    const simpleName = getSimpleColumnName(measure.column);
                    selectClauses.push(`${measure.aggregation.toUpperCase()}(${simpleName}) AS "${measure.aggregation}_of_${simpleName.replace(/"/g, '')}"`);
                }
            });
            const finalQuery = `SELECT ${selectClauses.join(', ')} FROM ${sourceTable} GROUP BY ${groupByOrdinals.join(', ')}`;
            console.log('Generated Pivot Table Query:', finalQuery, 'From Config:', newConfig);
            query = finalQuery;
        }
        
        return { ...newConfig, query };
    });
  }, [selectedWidgetType, allCalculatedFields]);
  
  const renderStepContent = () => {
    if (step === 0) return <WidgetTypeSelector onSelect={handleSelectType} />;
    if (step === 1) {
      switch (selectedWidgetType) {
        case 'data_table': return <DataTableConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        case 'kpi': return <KpiConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        case 'bar_chart': return <BarChartConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        case 'line_chart': return <LineChartConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} />;
        case 'pivot_table': return <PivotTableConfigScreen config={widgetConfig} onConfigChange={handleConfigChange} calculatedFields={allCalculatedFields} />;
        default: return <div className="text-center p-8"><p>Configurador no disponible.</p></div>;
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader><DialogTitle>{isEditMode ? 'Editar Widget' : 'Añadir Nuevo Widget'}</DialogTitle></DialogHeader>
        <div className="flex-grow min-h-0">
          {step > 0 && !isEditMode && <Button variant="ghost" onClick={handleBack} className="mb-2"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>}
          <div className="h-full">{renderStepContent()}</div>
        </div>
        <DialogFooter className="mt-4 flex-shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          {step === 1 && <Button onClick={handleSave} disabled={isSaving || !widgetConfig.query}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Guardar</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ConfigScreenLayout = ({ title, children, previewWidget }: any) => (
    <div className="flex flex-col md:flex-row gap-8 h-full">
        <div className="md:w-2/5 h-full flex flex-col">
            <h3 className="font-semibold text-lg border-b pb-2 flex-shrink-0">{title}</h3>
            <div className="flex-grow mt-4 overflow-y-auto pr-4 custom-scrollbar">
                {children}
            </div>
        </div>
        <div className="md:w-3/5 flex flex-col">
            <h3 className="font-semibold text-lg border-b pb-2">Vista Previa</h3>
            <div className="p-4 bg-slate-50 rounded-lg flex-grow mt-4">
                {previewWidget}
            </div>
        </div>
    </div>
);


const DataTableConfigScreen = ({ config, onConfigChange }: any) => (
    <ConfigScreenLayout 
        title="Configurar Tabla de Datos" 
        previewWidget={<DataTableWidget key={JSON.stringify(config)} widget={{ config }} isPreview={true} />}
    >
        <div className="space-y-2 mb-4">
            <Label>Nombre del Widget</Label>
            <Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })}/>
        </div>
        <DataTableConfig config={config} onChange={(newConf) => onConfigChange({ ...config, ...newConf })} />
    </ConfigScreenLayout>
);

const KpiConfigScreen = ({ config, onConfigChange }: any) => (
    <ConfigScreenLayout 
        title="Configurar KPI" 
        previewWidget={<KpiWidget widget={{ config }} />}
    >
        <div className="space-y-2 mb-4">
            <Label>Nombre del Widget</Label>
            <Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })}/>
        </div>
        <KpiConfig config={config} onChange={(newConf) => onConfigChange({ ...config, ...newConf })} />
    </ConfigScreenLayout>
);

const BarChartConfigScreen = ({ config, onConfigChange }: any) => (
    <ConfigScreenLayout 
        title="Configurar Gráfico de Barras" 
        previewWidget={<BarChartWidget widget={{ config }} />}
    >
        <div className="space-y-2 mb-4">
            <Label>Nombre del Widget</Label>
            <Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })}/>
        </div>
        <BarChartConfig config={config} onChange={(newConf) => onConfigChange({ ...config, ...newConf })} />
    </ConfigScreenLayout>
);

const LineChartConfigScreen = ({ config, onConfigChange }: any) => (
    <ConfigScreenLayout 
        title="Configurar Gráfico de Líneas" 
        previewWidget={<LineChartWidget widget={{ config }} />}
    >
        <div className="space-y-2 mb-4">
            <Label>Nombre del Widget</Label>
            <Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })}/>
        </div>
        <LineChartConfig config={config} onChange={(newConf) => onConfigChange({ ...config, ...newConf })} />
    </ConfigScreenLayout>
);

const PivotTableConfigScreen = ({ config, onConfigChange, calculatedFields }: any) => (
    <ConfigScreenLayout 
        title="Configurar Tabla Dinámica" 
        previewWidget={<PivotTableWidget key={JSON.stringify(config)} widget={{ config }} isPreview={true} />}
    >
        <div className="space-y-2 mb-4">
            <Label>Nombre del Widget</Label>
            <Input value={config.name || ''} onChange={(e) => onConfigChange({ ...config, name: e.target.value })} />
        </div>
        <PivotTableConfig config={config} onChange={(newConf) => onConfigChange({ ...config, ...newConf })} calculatedFields={calculatedFields} />
    </ConfigScreenLayout>
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
