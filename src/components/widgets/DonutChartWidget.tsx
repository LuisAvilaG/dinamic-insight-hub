
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/types/supabase';
import { Loader2, AlertCircle } from 'lucide-react';
import { CHART_COLOR_PALETTE } from '@/lib/colors'; // CORRECCIÓN: Importar el nombre correcto

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface DonutChartWidgetProps {
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

export const DonutChartWidget = ({ widget }: DonutChartWidgetProps) => {
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

  // Las claves 'name' y 'value' coinciden con los alias de la consulta SQL generada
  const categoryKey = 'name';
  const valueKey = 'value';

  if (!widgetConfig.series?.category?.key) {
    return <WidgetStatus status="error" message="La configuración de la categoría no está definida."/>;
  }

  return (
    <Card className="h-full w-full flex flex-col shadow-none border-none">
      <CardHeader className='py-2 px-4'>
        <CardTitle className='text-base font-medium'>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip 
              wrapperStyle={{ zIndex: 1000, fontSize: '12px' }} 
              formatter={(value, name) => [value, name]} />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={categoryKey}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              fill="#8884d8"
              paddingAngle={5}
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
