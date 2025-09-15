
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

// Componente robusto para la vista previa del gráfico de líneas
export const LineChart = ({ title, data, config }: PreviewProps) => {
  const xAxisKey = config?.axes?.xAxis?.key;
  // La dataKey para la línea siempre es "value" según la convención establecida en el query builder.
  const yAxisDataKey = "value";

  const renderContent = () => {
    if (!xAxisKey) {
      return (
        <div className="flex-grow flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Configuración de ejes incompleta.</p>
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
        <RechartsLineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            wrapperStyle={{ zIndex: 1000, fontSize: '12px' }} 
            formatter={(value: number) => [value, config?.axes?.yAxis?.key || 'Value']}
            labelFormatter={(label: string) => [label, xAxisKey]}
          />
          <Line type="monotone" dataKey={yAxisDataKey} stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        </RechartsLineChart>
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
