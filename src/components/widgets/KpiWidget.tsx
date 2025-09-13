
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface KpiWidgetProps {
    query: string;
    title: string;
}

export const KpiWidget = ({ query, title }: KpiWidgetProps) => {
    const [kpi, setKpi] = useState<number | string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchKpi = async () => {
            if (!query) return;

            setKpi(null);
            setError(null);

            try {
                 // *** CORRECCIÓN ***: Usando p_query y el esquema public por defecto
                const { data, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });

                if (rpcError) throw rpcError;
                
                if (data && data.length > 0) {
                    // Extraer el valor del primer campo del primer objeto (el KPI).
                    const firstResult = data[0];
                    const kpiValue = firstResult[Object.keys(firstResult)[0]];
                    setKpi(kpiValue);
                } else {
                    setKpi("N/A");
                }

            } catch (err: any) {
                setError(`Error: ${err.message}`);
                console.error(err);
            }
        };

        fetchKpi();
    }, [query]);

    return (
        <div className="p-4 text-center">
            <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
            <div className="text-4xl font-bold mt-2">
                {error ? <span className="text-red-500 text-sm">{error}</span> : kpi}
            </div>
        </div>
    );
};

