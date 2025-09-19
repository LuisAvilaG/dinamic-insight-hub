
import { WidgetType } from "@/components/widgets/AddWidget";
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

// LIMPIEZA TOTAL: Este componente ahora actúa como un simple orquestador.
// La lógica de validación y transformación ha sido eliminada porque la config y los datos ya vienen en el formato correcto.
export const WidgetPreview = ({ widgetType, config, title, table }: WidgetPreviewProps) => {
  // Aquí está el cambio clave:
  // En lugar de llamar a una función externa, usamos el 'query' que ya se ha generado
  // y almacenado en el objeto 'config' durante el proceso de configuración.
  const { query } = config;

  const { data, isLoading, error } = useQuery({
    queryKey: ['widget_preview', query],
    queryFn: async () => {
      if (!query) return null; // Si no hay query, no se ejecuta la llamada
      const { data, error } = await supabase.rpc('execute_query', { p_query: query });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!query, // La query solo se habilita si la string `query` existe
    refetchOnWindowFocus: false,
    retry: false,
  });

  const renderPreview = () => {
    // Si no hay query, significa que la configuración está incompleta.
    if (!query) {
      return <p className="text-sm text-muted-foreground">Configura el widget para ver una previsualización.</p>;
    }

    if (isLoading) {
      return <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> Cargando...</div>;
    }

    if (error) {
      return <p className="text-sm text-red-500">Error: {(error as Error).message}</p>;
    }

    if (!data || data.length === 0) {
        return <p className="text-sm text-muted-foreground">No se encontraron datos para esta configuración.</p>;
    }

    // La `config` y los `data` se pasan directamente. No más adaptaciones.
    const previewProps = { title, data, config };

    switch (widgetType) {
      case 'kpi':
        return <Kpi {...previewProps} />;
      case 'data_table':
        return <DataTable {...previewProps} />;
      case 'line_chart':
        return <LineChart {...previewProps} />;
      case 'bar_chart':
        return <BarChart {...previewProps} />;
      case 'donut_chart':
        return <DonutChart {...previewProps} />;
      default:
        return <p>Vista previa no disponible.</p>;
    }
  };

  return <div className="w-full h-full p-4 flex items-center justify-center bg-gray-50/50 rounded-lg border">{renderPreview()}</div>;
};
