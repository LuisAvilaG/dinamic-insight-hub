import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CHART_COLOR_PALETTE } from '@/lib/colors';

interface DonutChartWidgetProps {
  query: string;
  title: string;
}

interface QueryResult {
  [key: string]: any;
}

export const DonutChartWidget = ({ query, title }: DonutChartWidgetProps) => {
  const [data, setData] = useState<QueryResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<{ nameKey: string, valueKey: string } | null>(null);

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
            setKeys({ nameKey: firstRowKeys[0], valueKey: firstRowKeys[1] });
            setData(resultData);
          } else {
            throw new Error('La consulta para el gráfico de dona debe devolver al menos dos columnas (una para el nombre y otra para el valor).');
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
            <PieChart>
              <Pie
                data={data}
                dataKey={keys.valueKey}
                nameKey={keys.nameKey}
                cx="50%"
                cy="50%"
                innerRadius={'60%'}
                outerRadius={'80%'}
                paddingAngle={5}
                cornerRadius={5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: '#fff', border: '1px solid #ddd', borderRadius: '0.5rem'}}
              />
              <Legend iconSize={10} wrapperStyle={{fontSize: '14px'}}/>
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
