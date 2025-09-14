import { WidgetType } from "./AddWidget";
import { buildWidgetQuery } from "@/lib/widget_query_builder";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Kpi } from "./previews/Kpi";
import { LineChart } from "./previews/LineChart";
import { BarChart } from "./previews/BarChart";
import { DonutChart } from "./previews/DonutChart";
import { DataTable } from "./previews/DataTable";
import { Loader2 } from "lucide-react";

interface WidgetPreviewProps {
  widgetType: WidgetType;
  config: any;
  title: string;
  table: string | null;
}

export const WidgetPreview = ({ widgetType, config, title, table }: WidgetPreviewProps) => {
  const isConfigured = () => {
    if (!table) return false;

    switch (widgetType) {
      case 'kpi':
        return !!config.column && !!config.aggregation;
      
      case 'line_chart':
      case 'bar_chart':
        if (!config.xAxis || !config.yAxisAggregation) {
          return false;
        }
        if (config.yAxisAggregation !== 'COUNT' && !config.yAxisColumn) {
          return false;
        }
        return true;

      case 'donut_chart':
        return !!config.category && !!config.value;
        
      case 'data_table':
        return !!config.columns && config.columns.length > 0;
        
      default:
        return false;
    }
  }

  const query = isConfigured() ? buildWidgetQuery(widgetType, table!, config) : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ['widget_preview', query],
    queryFn: async () => {
      if (!query) return null;
      const { data, error } = await supabase.rpc('execute_sql', { query });
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!query 
  });

  const renderPreview = () => {
    if (!isConfigured()) {
      return <p className="text-sm text-muted-foreground">La previsualización aparecerá aquí.</p>;
    }

    if (isLoading) {
      return <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando datos...</div>;
    }

    if (error) {
      return <p className="text-sm text-red-500">Error al cargar datos: {(error as Error).message}</p>;
    }

    if (!data || data.length === 0) {
        return <p className="text-sm text-muted-foreground">No se encontraron datos para esta configuración.</p>;
    }

    // SOLUCIÓN: Copiar los datos para hacerlos extensibles antes de pasarlos a la librería de gráficos.
    const extensibleData = data.map(item => ({ ...item }));
    const previewProps = { title, data: extensibleData, config };

    switch (widgetType) {
      case 'kpi':
        return <Kpi {...previewProps} />;
      case 'line_chart':
        return <LineChart {...previewProps} />;
      case 'bar_chart':
        return <BarChart {...previewProps} />;
      case 'donut_chart':
        return <DonutChart {...previewProps} />;
      case 'data_table':
        return <DataTable {...previewProps} />;
      default:
        return <p>Vista previa no disponible.</p>;
    }
  };

  return <div className="w-full h-full p-4">{renderPreview()}</div>;
};