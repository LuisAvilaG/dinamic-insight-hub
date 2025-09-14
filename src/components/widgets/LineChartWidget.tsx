import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Line, LineChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CHART_COLOR_PALETTE } from '@/lib/colors';

interface LineChartWidgetProps {
  query: string;
  title: string;
}

interface QueryResult {
  [key: string]: any;
}

export const LineChartWidget = ({ query, title }: LineChartWidgetProps) => {
  const [data, setData] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ dimension: string, metric: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!query) return;

      setData(null);
      setError(null);
      setKeys(null);

      try {
        const { data: resultData, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });

        if (rpcError) throw rpcError;

        if (resultData && resultData.length > 0) {
          const firstRowKeys = Object.keys(resultData[0]);
          if (firstRowKeys.length >= 2) {
            setKeys({ dimension: firstRowKeys[0], metric: firstRowKeys[1] });
            setData(resultData);
          } else {
            throw new Error('La consulta debe devolver al menos dos columnas (dimensión y métrica).');
          }
        } else {
          setData([]);
        }

      } catch (err: any) {
        setError(`Error al ejecutar la consulta: ${err.message}`);
        console.error(err);
      }
    };

    fetchData();
  }, [query]);

  return (
    <Card className="h-full w-full">
      <CardHeader>
        <CardTitle className="text-base font-medium widget-drag-handle cursor-move">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)] w-full">
        {error && <div className="text-red-500 text-sm p-4 bg-red-100 rounded-md h-full">{error}</div>}
        {!error && data === null && <div className="flex items-center justify-center h-full">Cargando...</div>}
        {!error && data && data.length === 0 && <div className="flex items-center justify-center h-full">No se encontraron resultados.</div>}
        {!error && data && data.length > 0 && keys && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
              <XAxis dataKey={keys.dimension} tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                cursor={{ stroke: CHART_COLOR_PALETTE[1], strokeWidth: 1, strokeDasharray: "3 3" }} 
                contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem'}}
              />
              <Line 
                type="monotone" 
                dataKey={keys.metric} 
                stroke={CHART_COLOR_PALETTE[1]} 
                strokeWidth={2}
                dot={{ r: 4, fill: CHART_COLOR_PALETTE[1] }}
                activeDot={{ r: 8 }}
                name={keys.metric.charAt(0).toUpperCase() + keys.metric.slice(1)} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
