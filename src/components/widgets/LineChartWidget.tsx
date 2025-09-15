
import { useQuery } from '@tanstack/react-query';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface LineChartWidgetProps {
  widget: Widget;
}

// Componente de estado reutilizado
const WidgetStatus = ({ status, message }: { status: 'loading' | 'error' | 'empty', message: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-4">
    {status === 'loading' && <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />}
    {status === 'error' && <AlertCircle className="h-8 w-8 text-red-400" />}
    <p className={`mt-2 font-medium ${status === 'error' ? 'text-red-600' : 'text-slate-600'}`}>
      {status === 'loading' && 'Cargando Datos...'}
      {status === 'error' && 'Error al Cargar'}
      {status === 'empty' && 'Sin Datos'}
    </p>
    <p className="text-xs text-slate-500 mt-1">{message}</p>
  </div>
);

export const LineChartWidget = ({ widget }: LineChartWidgetProps) => {
  const { title, config, query } = widget;
  const widgetConfig = config as any;

  const { data, isLoading, error } = useQuery({
    queryKey: ['widget_data', widget.id],
    queryFn: async () => {
      if (!query) throw new Error('La consulta SQL no está definida.');
      const { data, error } = await supabase.rpc('execute_query', { p_query: query });
      if (error) throw new Error(`Error en la consulta: ${error.message}`);
      return data || [];
    },
    enabled: !!query,
  });

  if (isLoading) return <WidgetStatus status="loading" message="Ejecutando la consulta del widget."/>;
  if (error) return <WidgetStatus status="error" message={error.message}/>;
  if (!data || data.length === 0) return <WidgetStatus status="empty" message="La consulta no devolvió resultados."/>;

  const xAxisKey = widgetConfig.axes?.xAxis?.key;
  const yAxisKey = 'value'; // La consulta SQL siempre devuelve el valor principal como 'value'

  if (!xAxisKey) {
    return <WidgetStatus status="error" message="La configuración del eje X no está definida."/>;
  }

  return (
    <Card className="h-full w-full flex flex-col shadow-none border-none">
      <CardHeader className='py-2 px-4'>
        <CardTitle className='text-base font-medium'>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey={xAxisKey}
              stroke="#888888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis 
              stroke="#888888"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              wrapperStyle={{ zIndex: 1000, fontSize: '12px' }}
              formatter={(value: number, name: string) => [value, widgetConfig.axes.yAxis.key || name]}
              labelFormatter={(label: string) => [label, xAxisKey]}
            />
            <Line type="monotone" dataKey={yAxisKey} stroke="#8884d8" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
