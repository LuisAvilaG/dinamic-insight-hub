import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { KpiWidget } from "./KpiWidget";
import { TableWidget } from "./TableWidget";

// Tipo para los datos del widget, debe coincidir con el que usamos en la página de detalle
type WidgetData = {
  id: string;
  dashboard_id: string;
  title: string;
  type: string;
  position: object;
  query: string;
  options: object;
  created_at: string;
};

interface WidgetProps {
  data: WidgetData;
}

/**
 * Componente Widget genérico.
 * Actúa como un router que renderiza el tipo de widget correcto 
 * basándose en la propiedad 'type' de los datos.
 */
export const Widget = ({ data }: WidgetProps) => {
  const renderContent = () => {
    switch (data.type) {
      case 'kpi':
        return <KpiWidget query={data.query} options={data.options} />;
      case 'table':
        return <TableWidget query={data.query} options={data.options} />;
      // Futuros tipos de widgets se añadirían aquí
      // case 'chart':
      //   return <ChartWidget query={data.query} />;
      default:
        return <p className="text-red-500">Tipo de widget desconocido: {data.type}</p>;
    }
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
