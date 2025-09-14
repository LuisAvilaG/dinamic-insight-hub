import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PreviewProps {
  title: string;
  data: any[];
  config: any;
}

// Función para formatear el número (simplificada)
const formatNumber = (num: number) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const Kpi = ({ title, data, config }: PreviewProps) => {
  if (!data || data.length === 0) return null;

  // El resultado de la consulta SQL para un KPI es un único objeto con una clave (ej: 'sum', 'count')
  const resultKey = Object.keys(data[0])[0];
  const value = data[0][resultKey];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-4xl font-bold">
          {typeof value === 'number' ? formatNumber(value) : value}
        </p>
      </CardContent>
    </Card>
  );
};
