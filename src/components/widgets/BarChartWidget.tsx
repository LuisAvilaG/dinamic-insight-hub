
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tables } from '@/types/supabase';

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface BarChartWidgetProps {
  widget: Widget;
}

export const BarChartWidget = ({ widget }: BarChartWidgetProps) => {
  const { config } = widget;
  const { name, query, xAxis, yAxis } = config as any; 
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      if (!query) {
        setError(null); 
        setIsLoading(false);
        setChartData([]);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });
        if (rpcError) throw rpcError;
        setChartData(data || []);
      } catch (err: any) {
        setError(`Error en consulta: ${err.message}`);
        console.error("Error al ejecutar la consulta del gráfico:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [query]);

  const renderContent = () => {
    if (isLoading) return <Loader2 className="h-8 w-8 mx-auto animate-spin text-slate-400" />;
    if (error) return <p className="text-xs text-red-500 text-center px-2">{error}</p>;
    if (!query && !isLoading) return <p className="text-sm text-slate-400 text-center">Configure el gráfico para ver los datos.</p>;
    if (chartData.length === 0) return <p className="text-sm text-slate-400 text-center">No hay datos para mostrar.</p>;

    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" height={60} />
            <YAxis tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(value as number)} />
            <Tooltip formatter={(value) => new Intl.NumberFormat().format(value as number)} />
            <Legend />
            <Bar dataKey="value" fill="#3b82f6" name={yAxis === '*' ? 'Total' : yAxis || 'Valor'} />
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <Card className="h-full flex flex-col justify-center border-none shadow-none bg-transparent">
        <CardHeader className="pb-2 text-center">
            <CardTitle className="text-base font-medium truncate" title={name}>{name || 'Gráfico sin nombre'}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center h-full w-full">
            {renderContent()}
        </CardContent>
    </Card>
  );
};

export default BarChartWidget;
