import { DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { WidgetType } from "./AddWidget";
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

type WidgetData = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface AddWidgetProps {
  dashboardId: string;
  onSave: () => void;
  onBack: () => void;
  widgetType: WidgetType;
  title: string;
  widgets: WidgetData[];
}

export const AddWidget = ({ dashboardId, onSave, onBack, widgetType, title, widgets }: AddWidgetProps) => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [config, setConfig] = useState<any>({});

  const { data: tables, isLoading: isLoadingTables } = useQuery({
    queryKey: ['user_tables'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_tables');
      if (error) throw new Error(error.message);
      return data.map((t: any) => t.table_name);
    }
  });

  const { data: columns, isLoading: isLoadingColumns } = useQuery({
    queryKey: ['table_columns', selectedTable],
    queryFn: async () => {
      if (!selectedTable) return [];
      const { data, error } = await supabase.rpc('get_table_columns', { p_schema_name: 'be_exponential', p_table_name: selectedTable });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!selectedTable 
  });

  const handleSave = async () => {
    const newWidgetOrder = widgets.length > 0 ? Math.max(...widgets.map(w => w.layout.order || 0)) + 1 : 0;
    const query = buildWidgetQuery(widgetType, selectedTable!, config);

    const { error } = await supabase.rpc('insert_widget', {
      p_dashboard_id: dashboardId,
      p_widget_type_text: widgetType,
      p_config: { ...config, title, query },
      p_layout: {
        x: (widgets.length * 4) % 12, // Basic layout logic
        y: Infinity, // Let the grid handle it
        w: widgetType === 'kpi' ? 2 : 4,
        h: widgetType === 'kpi' ? 2 : 4,
        order: newWidgetOrder
      }
    });

    if (error) {
      console.error("Error guardando el widget", error);
      toast.error("Error al guardar el widget", { description: error.message });
    } else {
      toast.success("Widget guardado con éxito");
      onSave();
    }
  };

  const renderConfig = () => {
    if (!selectedTable || !columns) return null;
    
    const props = { config, setConfig, columns, selectedTable };

    switch (widgetType) {
      case 'kpi':
        return <KpiConfig {...props} />;
      case 'line_chart':
        return <LineChartConfig {...props} />;
      case 'bar_chart':
        return <BarChartConfig {...props} />;
      case 'donut_chart':
        return <DonutChartConfig {...props} />;
      case 'data_table':
        return <TableConfig {...props} />;
      default:
        return <p>Configuración no disponible para este tipo de widget.</p>;
    }
  };
  
  const isSaveDisabled = () => {
    if (!selectedTable) return true;

    switch (widgetType) {
      case 'kpi':
        return !config.column || !config.aggregation;
      
      case 'line_chart':
      case 'bar_chart':
        // Must have an X-axis and an aggregation method.
        if (!config.xAxis || !config.yAxisAggregation) {
          return true;
        }
        // If aggregation is not COUNT, it needs a specific column to aggregate.
        if (config.yAxisAggregation !== 'COUNT' && !config.yAxisColumn) {
          return true;
        }
        return false; // If all checks pass, the button is enabled.

      case 'donut_chart':
        return !config.category || !config.value;
        
      case 'data_table':
        return !config.columns || config.columns.length === 0;
        
      default:
        return true;
    }
  }

  return (
    <div className="h-full flex flex-col">
      <DialogHeader>
        <DialogTitle>Paso 3: Configura y guarda tu widget</DialogTitle>
        <p className="text-sm text-muted-foreground">
          Estás creando un widget <span className="font-semibold">{title}</span> de tipo <span className="font-semibold">{widgetType}</span>.
        </p>
      </DialogHeader>

      <div className="grid grid-cols-5 gap-6 py-4 flex-grow overflow-hidden">
        {/* Columna de Configuración (40%) */}
        <div className="col-span-2 flex flex-col gap-4 overflow-y-auto pr-4">
          <TableSelector
            tables={tables || []}
            selectedTable={selectedTable}
            onTableSelect={setSelectedTable}
            isLoading={isLoadingTables}
          />
          {renderConfig()}
        </div>

        {/* Columna de Previsualización (60%) */}
        <div className="col-span-3 flex flex-col">
          <div className="flex-grow rounded-lg bg-muted/50 border border-dashed flex items-center justify-center">
            <WidgetPreview 
              widgetType={widgetType} 
              config={config} 
              title={title} 
              table={selectedTable} 
            />
          </div>
        </div>
      </div>

      <DialogFooter className="mt-auto pt-4">
        <Button variant="outline" onClick={onBack}>Atrás</Button>
        <Button onClick={handleSave} disabled={isSaveDisabled()}>Guardar Widget</Button>
      </DialogFooter>
    </div>
  );
};