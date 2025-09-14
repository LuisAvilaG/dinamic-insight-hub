import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { getKpiIconStyle } from '@/lib/colors';

interface KpiWidgetProps {
    query: string;
    title: string;
}

// Función para formatear el valor del KPI de forma atractiva
const formatKpiValue = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';

    if (num >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
        return `$${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const KpiWidget = ({ query, title }: KpiWidgetProps) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!query) return;
            setData(null);
            setError(null);
            try {
                const { data: resultData, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });
                if (rpcError) throw rpcError;

                if (resultData && resultData.length > 0) {
                    const firstRow = resultData[0];
                    const value = firstRow[Object.keys(firstRow)[0]];
                    setData(value);
                } else {
                    setData(0);
                }
            } catch (err: any) {
                setError(err.message);
                console.error(err);
            }
        };
        fetchData();
    }, [query]);

    const iconStyle = getKpiIconStyle(title);
    
    // Placeholder para el indicador de cambio. En un futuro, podría venir de la consulta.
    const percentageChange = Math.floor(Math.random() * 20) + 1;
    const isPositive = Math.random() > 0.5;

    const renderContent = () => {
        if (error) {
            return <div className="text-red-500 text-sm p-2 flex items-center"><AlertCircle className="h-4 w-4 mr-2"/>Error</div>;
        }
        if (data === null) {
            return <div className="text-2xl font-bold animate-pulse text-slate-300">...</div>;
        }
        return <div className="text-3xl font-bold">{formatKpiValue(data)}</div>;
    };

    return (
        <Card className="h-full w-full flex flex-col justify-center widget-drag-handle cursor-move">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-lg ${iconStyle.background}`}>
                        <DollarSign className={`h-7 w-7 ${iconStyle.foreground}`} />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground font-medium">{title}</p>
                        {renderContent()}
                    </div>
                </div>
                <div className="flex items-center text-sm font-semibold self-end mb-1">
                   {isPositive ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                   ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                   )}
                   <span className={isPositive ? "text-green-500" : "text-red-500"}>
                      {percentageChange}%
                   </span>
                </div>
            </CardContent>
        </Card>
    );
};
