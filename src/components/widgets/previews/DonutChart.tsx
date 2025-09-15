
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];

// Componente robusto para la vista previa del gráfico de Donut
export const DonutChart = ({ title, data, config }: PreviewProps) => {
  const categoryKey = config?.series?.category?.key;
  const metricAgg = config?.series?.metric?.aggregation;

  const renderContent = () => {
    if (!categoryKey || !metricAgg) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Configuración de series incompleta.</p>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No hay datos para esta configuración.</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            wrapperStyle={{ zIndex: 1000, fontSize: '12px' }}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={"60%"}
            outerRadius={"80%"}
            fill="#8884d8"
            paddingAngle={data.length > 1 ? 5 : 0}
            dataKey="value" // El query builder asegura que el valor es "value"
            nameKey="name"   // El query builder asegura que la categoría es "name"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
