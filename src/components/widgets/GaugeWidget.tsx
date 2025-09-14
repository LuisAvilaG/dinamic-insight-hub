import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveBar } from '@nivo/bar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GaugeWidgetProps {
  title: string;
  config: {
    maxValue?: number;
    unit?: string;
    currentValueSource?: 'sql' | 'manual';
    currentValue?: number;
    currentValueQuery?: string;
    style?: 'bar'; // Solo se permite el estilo 'bar'
  };
}

const GaugeWidget = ({ title, config }: GaugeWidgetProps) => {
  const { 
    maxValue = 100, 
    unit = '', 
    currentValueSource = 'sql', 
    currentValue = 0, 
    currentValueQuery = '',
    style = 'bar'
  } = config;

  const [value, setValue] = useState(currentValueSource === 'manual' ? currentValue : 0);
  const [loading, setLoading] = useState(currentValueSource === 'sql');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentValueSource !== 'sql' || !currentValueQuery) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('execute_query', { p_query: currentValueQuery });
        if (rpcError) throw rpcError;

        if (rpcData && rpcData.length > 0) {
          const firstRow = rpcData[0];
          const key = Object.keys(firstRow)[0];
          setValue(parseFloat(firstRow[key]) || 0);
        } else {
          setValue(0);
        }
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentValueQuery, currentValueSource]);

  if (loading) return <div className="h-full w-full flex items-center justify-center">Cargando...</div>;
  if (error) return <div className="h-full w-full flex items-center justify-center text-red-500 text-sm p-2">Error: {error}</div>;

  return (
    <Card className="h-full w-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold truncate">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center">
          <div className="w-full h-full max-h-48">
            <ResponsiveBar
                data={[{ id: 'progress', value: value }]}
                keys={['value']}
                indexBy="id"
                maxValue={maxValue}
                layout="horizontal"
                margin={{ top: 10, right: 20, bottom: 40, left: 20 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'light_blue_green' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisLeft={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: `${value}${unit} / ${maxValue}${unit}`,
                    legendPosition: 'middle',
                    legendOffset: 32
                }}
                enableLabel={true}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                animate={true}
                isInteractive={false}
            />
        </div>
      </CardContent>
    </Card>
  );
};

export default GaugeWidget;
