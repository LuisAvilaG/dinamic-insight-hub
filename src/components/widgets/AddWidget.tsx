
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from "sonner";
import { TableSelector } from "./config/TableSelector";
import { KpiConfig } from "./config/KpiConfig";
import { LineChartConfig } from "./config/LineChartConfig";
import { BarChartConfig } from "./config/BarChartConfig";
import { DonutChartConfig } from "./config/DonutChartConfig";
import { TableConfig } from "./config/TableConfig";
import { WidgetPreview } from "./WidgetPreview";
import { buildWidgetQuery } from "@/lib/widget_query_builder";
import { Tables } from '@/types/supabase'; 

export type WidgetType = 'kpi' | 'line_chart' | 'bar_chart' | 'donut_chart' | 'data_table';
type WidgetData = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface AddWidgetProps {
  dashboardId: string;
  onSave: () => void;
  onBack: () => void;
  widgetType: WidgetType;
  title: string;
  widgets: WidgetData[];
  widgetToEdit?: WidgetData | null;
}

const getNormalizedConfigForEdit = (config: any, type: WidgetType) => {
    if (!config) return {};
    if (config.axes || config.series) return config;
    const newConfig = { ...config };
    if ((type === 'bar_chart' || type === 'line_chart') && config.xAxis) {
        newConfig.axes = {
            xAxis: { key: config.xAxis },
            yAxis: { key: config.yAxisColumn, aggregation: config.yAxisAggregation }
        };
    }
    if (type === 'donut_chart' && config.category) {
        newConfig.series = {
            category: { key: config.category },
            metric: { key: config.value, aggregation: config.valueAggregation || 'SUM' }
        };
    }
    return newConfig;
}

export const AddWidget = ({ dashboardId, onSave, onBack, widgetType, title: initialTitle, widgets, widgetToEdit }: AddWidgetProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [config, setConfig] = useState<any>({});

  const isEditMode = !!widgetToEdit;

  useEffect(() => {
    if (isEditMode && widgetToEdit) {
      const normalizedConfig = getNormalizedConfigForEdit(widgetToEdit.config as any, widgetToEdit.widget_type as WidgetType);
      setTitle(normalizedConfig.title || initialTitle);
      setSelectedTable(normalizedConfig.table || null);
      setConfig(normalizedConfig || {});
    } else {
      // Ensure title is in sync for new widgets
      setTitle(initialTitle);
    }
  }, [isEditMode, widgetToEdit, initialTitle]);

  const { data: tables, isLoading: isLoadingTables } = useQuery({ queryKey: ['user_tables'], queryFn: async () => {
    const { data, error } = await supabase.rpc('get_user_tables');
    if (error) throw new Error(error.message);
    return data.map((t: any) => t.table_name);
  }});

  const { data: columns, isLoading: isLoadingColumns } = useQuery({ queryKey: ['table_columns', selectedTable], queryFn: async () => {
    if (!selectedTable) return [];
    const { data, error } = await supabase.rpc('get_table_columns', { p_schema_name: 'be_exponential', p_table_name: selectedTable });
    if (error) throw new Error(error.message);
    return data;
  }, enabled: !!selectedTable });

  const handleSave = async () => {
    const query = buildWidgetQuery(widgetType, selectedTable!, config);
    const finalConfig = { ...config, title, query, table: selectedTable };

    if (isEditMode) {
      const { error } = await supabase.rpc('update_widget', { p_widget_id: widgetToEdit.id, p_config: finalConfig });
      if (error) toast.error("Error al actualizar el widget", { description: error.message });
      else { toast.success("Widget actualizado con éxito"); onSave(); }
    } else {
      const newWidgetOrder = widgets.length > 0 ? Math.max(...widgets.map(w => w.layout.order || 0)) + 1 : 0;
      const { error } = await supabase.rpc('insert_widget', {
        p_dashboard_id: dashboardId,
        p_widget_type_text: widgetType,
        p_config: finalConfig,
        p_layout: { x: (widgets.length * 4) % 12, y: 0, w: widgetType === 'kpi' ? 2 : 4, h: widgetType === 'kpi' ? 2 : 4, order: newWidgetOrder }
      });
      if (error) toast.error("Error al guardar el widget", { description: error.message });
      else { toast.success("Widget guardado con éxito"); onSave(); }
    }
  };

  const renderConfig = () => {
    if (!selectedTable || !columns) return null;
    const props = { config, setConfig, columns, selectedTable };
    switch (widgetType) {
      case 'kpi': return <KpiConfig {...props} />;
      case 'line_chart': return <LineChartConfig {...props} />;
      case 'bar_chart': return <BarChartConfig {...props} />;
      case 'donut_chart': return <DonutChartConfig {...props} />;
      case 'data_table': return <TableConfig {...props} />;
      default: return <p>Configuración no disponible.</p>;
    }
  };
  
  const isSaveDisabled = () => {
    if (!selectedTable) return true;
    switch (widgetType) {
      case 'kpi':
        return !config.column || !config.aggregation;
      case 'line_chart':
      case 'bar_chart':
        return !config.axes?.xAxis?.key || !config.axes?.yAxis?.aggregation || (config.axes.yAxis.aggregation !== 'COUNT' && !config.axes.yAxis.key);
      case 'donut_chart':
        return !config.series?.category?.key || !config.series?.metric?.aggregation || (config.series.metric.aggregation !== 'COUNT' && !config.series.metric.key);
      case 'data_table':
        return !config.columns || config.columns.length === 0;
      default: return true;
    }
  };

  const saveButtonText = isEditMode ? "Guardar Cambios" : "Guardar Widget";

  return (
    <div className="h-full flex flex-col pt-4">
      {/* SE HA ELIMINADO EL DialogHeader DE AQUÍ */}
      <div className="grid grid-cols-5 gap-6 flex-grow overflow-hidden">
        <div className="col-span-2 flex flex-col gap-4 overflow-y-auto pr-4">
          <TableSelector tables={tables || []} selectedTable={selectedTable} onTableSelect={(table) => { setConfig({}); setSelectedTable(table); }} isLoading={isLoadingTables} />
          {renderConfig()}
        </div>
        <div className="col-span-3 flex flex-col">
          <div className="flex-grow rounded-lg bg-muted/50 border border-dashed flex items-center justify-center">
            <WidgetPreview widgetType={widgetType} config={config} title={title} table={selectedTable} />
          </div>
        </div>
      </div>
      <DialogFooter className="mt-auto pt-4">
        {!isEditMode && <Button variant="outline" onClick={onBack}>Atrás</Button>}
        <Button onClick={handleSave} disabled={isSaveDisabled()}>{saveButtonText}</Button>
      </DialogFooter>
    </div>
  );
};
