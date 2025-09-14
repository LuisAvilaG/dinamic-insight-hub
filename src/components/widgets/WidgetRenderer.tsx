import { KpiWidget } from "./KpiWidget";
import { TableWidget } from "./TableWidget";
import { BarChartWidget } from "./BarChartWidget";
import { LineChartWidget } from "./LineChartWidget";
import { DonutChartWidget } from "./DonutChartWidget";
import GaugeWidget from "./GaugeWidget";
import { TimeSeriesWidget } from "./TimeSeriesWidget"; // 1. Importar TimeSeriesWidget
import { Card, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { WidgetToolbar } from "./WidgetToolbar";

type WidgetFromDB = {
  id: string;
  type: string;
  title: string;
  query: string;
  config: object | null;
  layout: object;
};

interface WidgetRendererProps {
  widget: WidgetFromDB;
  isEditMode?: boolean;
  onWidgetDeleted: (widgetId: string) => void;
  onWidgetUpdated: () => void;
}

const UnknownWidget = ({ type, id }: { type: string | null, id: string }) => (
  <Card className="border-dashed border-slate-300 h-full w-full">
    <CardContent className="flex flex-col items-center justify-center h-full text-center p-4">
        <HelpCircle className="h-8 w-8 text-slate-400 mb-2" />
        <p className="font-semibold text-slate-600">Widget Desconocido</p>
        <p className="text-xs text-slate-500 mt-1">
          No se pudo renderizar el widget. 
          <br /> 
          Tipo recibido: <span className="font-mono bg-slate-100 px-1 rounded">{type || 'N/A'}</span>
        </p>
    </CardContent>
  </Card>
);

export const WidgetRenderer = ({ widget, isEditMode, onWidgetDeleted, onWidgetUpdated }: WidgetRendererProps) => {
  const { type, query, config, title, id } = widget;

  const widgetTitle = typeof title === 'string' ? title : 'Widget sin título';
  const widgetQuery = typeof query === 'string' ? query : '';
  const widgetConfig = config || {};

  const renderWidget = () => {
    // 2. Añadir el caso para 'time_series'
    switch (type) {
        case 'kpi':
            return <KpiWidget query={widgetQuery} title={widgetTitle} />;
        case 'gauge':
            return <GaugeWidget config={widgetConfig as any} title={widgetTitle} />;
        case 'time_series': // 3. Renderizar TimeSeriesWidget
            return <TimeSeriesWidget query={widgetQuery} config={widgetConfig as any} title={widgetTitle} />;
        case 'table':
            return <TableWidget query={widgetQuery} title={widgetTitle} />;
        case 'bar_chart': 
            return <BarChartWidget query={widgetQuery} title={widgetTitle} />;
        case 'line_chart':
            return <LineChartWidget query={widgetQuery} title={widgetTitle} />;
        case 'donut_chart':
            return <DonutChartWidget query={widgetQuery} title={widgetTitle} />;
        default:
            return <UnknownWidget type={type} id={id} />;
    }
  };

  return (
    <div className={`h-full w-full relative group ${isEditMode ? 'pointer-events-none' : ''}`}>
        {isEditMode && (
            <div className="absolute top-1 right-1 z-20 pointer-events-auto">
                <WidgetToolbar 
                  widget={widget} 
                  onWidgetDeleted={onWidgetDeleted}
                  onWidgetUpdated={onWidgetUpdated}
                />
            </div>
        )}
        <div className={`h-full w-full ${isEditMode ? 'opacity-60' : ''}`}>
            {renderWidget()}
        </div>
    </div>
  );

};
