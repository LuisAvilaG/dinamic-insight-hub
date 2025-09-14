import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveLine } from '@nivo/line';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeSeriesWidgetProps {
  query: string;
  title: string;
  config: {
    timeGrain?: string;
  };
}

// Función para formatear las etiquetas del eje X según el timeGrain
const formatTick = (timeGrain: string) => (value: any) => {
  const date = new Date(value);
  switch (timeGrain) {
    case 'day':
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    case 'week':
      return `Sem ${date.toLocaleDateString('es-ES', { week: 'numeric' })}`;
    case 'month':
      return date.toLocaleDateString('es-ES', { month: 'long' });
    case 'quarter':
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `Q${quarter} ${date.getFullYear()}`;
    case 'year':
      return date.getFullYear().toString();
    default:
      return date.toLocaleDateString('es-ES');
  }
};

export const TimeSeriesWidget = ({ query, title, config }: TimeSeriesWidgetProps) => {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });
        if (rpcError) throw rpcError;

        // Transformar los datos para Nivo
        const transformedData = [{
          id: title,
          data: rpcData.map((d: any) => ({
            x: d.time_period,
            y: d.value,
          })),
        }];

        setData(transformedData);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query, title]);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Cargando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-sm p-4">Error: {error}</div>;
  }

  if (!data || data[0].data.length === 0) {
    return <div className="flex items-center justify-center h-full text-slate-500">No hay datos para mostrar.</div>;
  }

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-center truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
          <ResponsiveLine
              data={data}
              margin={{ top: 10, right: 40, bottom: 60, left: 60 }}
              xScale={{
                  type: 'time',
                  format: '%Y-%m-%dT%H:%M:%S.%L%Z',
                  precision: 'day',
              }}
              xFormat="time:%Y-%m-%d"
              yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                  format: formatTick(config.timeGrain || 'day'),
                  tickRotation: -45,
                  legend: 'Período de Tiempo',
                  legendOffset: 50,
                  legendPosition: 'middle'
              }}
              axisLeft={{
                  orient: 'left',
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Valor',
                  legendOffset: -50,
                  legendPosition: 'middle'
              }}
              pointSize={8}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              useMesh={true}
              colors={{ scheme: 'category10' }}
              animate={true}
          />
      </CardContent>
    </Card>
  );
};
