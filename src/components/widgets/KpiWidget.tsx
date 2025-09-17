
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Tables } from '@/types/supabase';

type Widget = Tables<'report_widgets', { schema: 'be_exponential' }>;

interface KpiWidgetProps {
  widget: Widget;
}

export const KpiWidget = ({ widget }: KpiWidgetProps) => {
  const { config } = widget;
  const { name, query } = config as any;
  
  const [result, setResult] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      if (!query) {
        setError('La configuración del widget está incompleta.');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });
        if (rpcError) throw rpcError;
        setResult(data && data.length > 0 ? data[0].value : 0);
      } catch (err: any) {
        setError(`Error en consulta: ${err.message}`);
        console.error("Error al ejecutar la consulta del KPI:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, [query]);

  const renderContent = () => {
    if (isLoading) {
      return <Loader2 className="h-8 w-8 mx-auto animate-spin text-slate-400" />;
    }
    if (error) {
      return <p className="text-xs text-red-500 text-center px-2">{error}</p>;
    }
    return (
      <p className="text-5xl font-bold text-center">
        {result !== null ? new Intl.NumberFormat().format(result) : 'N/A'}
      </p>
    );
  }

  return (
    <Card className="h-full flex flex-col justify-center border-none shadow-none bg-transparent">
      <CardHeader className="pb-2 text-center">
        <CardTitle className="text-base font-medium truncate" title={name}>{name || 'KPI sin nombre'}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center h-full">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default KpiWidget;
