import { Tables } from "@/types/supabase";
import { KpiWidget } from "./KpiWidget";
import { TableWidget } from "./TableWidget";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

// Extiende el tipo Widget para poder añadirle un nombre en el futuro
type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface WidgetRendererProps {
  widget: Widget;
}

// Un componente de fallback para tipos de widget desconocidos o no implementados
const UnknownWidget = ({ type }: { type: string }) => (
  <Card className="bg-amber-50 border border-amber-200">
    <CardHeader>
      <CardTitle className="text-amber-800 text-base">Widget no implementado</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center justify-center h-32 text-amber-700">
        <AlertTriangle className="h-6 w-6 mb-2" />
        <p className="text-sm">El tipo de widget <span className="font-mono bg-amber-100 px-1 rounded">{type}</span> aún no es soportado.</p>
    </CardContent>
  </Card>
);

export const WidgetRenderer = ({ widget }: WidgetRendererProps) => {
  // Extraemos las propiedades del widget para pasarlas al componente correspondiente
  const { widget_type, query } = widget;
  
  // Por ahora, el título será el tipo de widget. Más adelante se podrá configurar.
  const title = widget.widget_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Decidimos qué componente renderizar basándonos en el widget_type
  switch (widget_type) {
    case 'kpi':
      return <KpiWidget query={query} title={title} />;
    case 'table':
      return <TableWidget query={query} title={title} />;
    // Aquí se añadirían más casos para 'bar_chart', 'line_chart', etc.
    default:
      return <UnknownWidget type={widget_type} />;
  }
};
