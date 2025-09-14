import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveLine, Serie } from '@nivo/line';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LineChartWidgetProps {
  title: string;
  config: {
    query: string;
    curve?: 'basis' | 'cardinal' | 'catmullRom' | 'linear' | 'monotoneX' | 'monotoneY' | 'natural' | 'step' | 'stepAfter' | 'stepBefore';
    pointSize?: number;
    enableArea?: boolean;
  };
}

export const LineChartWidget = ({ title, config }: LineChartWidgetProps) => {
  const { 
    query,
    curve = 'linear',
    pointSize = 10,
    enableArea = false 
  } = config;

  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });
        if (rpcError) throw rpcError;
        setData(rpcData || []);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  if (loading) return <div className="h-full w-full flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="h-full w-full flex items-center justify-center text-red-500 text-sm p-2">Error: {error}</div>;
  if (!data || data.length === 0) return <div className="h-full w-full flex items-center justify-center">No hay datos.</div>;

  const keys = Object.keys(data[0]);
  const xKey = keys[0]; // La primera columna es el eje X
  const yKeys = keys.slice(1); // El resto son las métricas (líneas)

  const transformedData: Serie[] = yKeys.map(key => ({
    id: key,
    data: data.map(d => ({ x: d[xKey], y: d[key] }))
  }));

  const isTimeScale = data.length > 0 && !isNaN(new Date(data[0][xKey]).getTime());

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-center text-base font-semibold truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsiveLine
          data={transformedData}
          curve={curve}
          enableArea={enableArea}
          pointSize={pointSize}
          margin={{ top: 10, right: 110, bottom: 50, left: 60 }}
          xScale={isTimeScale ? { type: 'time', format: 'auto', precision: 'day' } : { type: 'point' }}
          xFormat={isTimeScale ? "time:%Y-%m-%d" : undefined}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false, reverse: false }}
          yFormat=",.0f"
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: xKey,
            legendOffset: 36,
            legendPosition: 'middle',
            format: isTimeScale ? '%b %d' : undefined,
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Valor',
            legendOffset: -40,
            legendPosition: 'middle'
          }}
          pointColor={{ theme: 'background' }}
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
      </CardContent>
    </Card>
  );
};
