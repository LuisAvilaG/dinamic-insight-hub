import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BarChartWidgetProps {
  title: string;
  config: {
    query: string;
    layout?: 'vertical' | 'horizontal';
    colors?: string;
  };
}

export const BarChartWidget = ({ title, config }: BarChartWidgetProps) => {
  const { query, layout = 'vertical', colors = 'nivo' } = config;
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
  const indexBy = keys[0];
  const chartKeys = keys.slice(1);

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-center text-base font-semibold truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <ResponsiveBar
          data={data}
          keys={chartKeys}
          indexBy={indexBy}
          layout={layout}
          margin={{ top: 10, right: 60, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={{ scheme: colors }}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: indexBy,
            legendPosition: 'middle',
            legendOffset: 32
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: chartKeys.length > 1 ? 'count' : chartKeys[0],
            legendPosition: 'middle',
            legendOffset: -40
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
          animate={true}
        />
      </CardContent>
    </Card>
  );
};
