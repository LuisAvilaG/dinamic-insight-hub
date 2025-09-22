
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Pivot } from '@webdatarocks/react-webdatarocks';
import "@webdatarocks/webdatarocks/webdatarocks.min.css";

interface PivotTableWidgetProps {
  widget: {
    config: {
      name?: string;
      query?: string;
      rows?: string[];
      columns?: string[];
      measures?: { column: string; aggregation: string }[];
    }
  };
  isPreview?: boolean;
}

export const PivotTableWidget: React.FC<PivotTableWidgetProps> = ({ widget, isPreview = false }) => {
    const [viewData, setViewData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { config } = widget;

    useEffect(() => {
        const fetchData = async () => {
            if (!config.query) {
                setError("La configuración del widget está incompleta.");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                const { data, error } = await supabase.rpc('execute_query', { p_query: config.query });
                if (error) throw error;
                setViewData(data || []);
            } catch (err: any) {
                setError(`Error al cargar datos: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [config.query]);
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error) {
        return <div className="text-red-500 p-4">{error}</div>;
    }
    
    // **FIX**: The uniqueName for the measure must match the alias from the SQL query.
    // The aggregation is done in the SQL, so WebDataRocks just needs to sum the pre-aggregated values.
    const report = {
        dataSource: {
            data: viewData
        },
        slice: {
            rows: config.rows?.map(r => ({ uniqueName: r })),
            columns: config.columns?.map(c => ({ uniqueName: c })),
            measures: config.measures?.map(m => ({
                uniqueName: `${m.aggregation}_of_${m.column}`,
                aggregation: "sum" // Since data is pre-aggregated, sum works as a display mechanism.
            }))
        },
        formats: config.measures?.map(m => ({
            name: `${m.aggregation}_of_${m.column}`,
            caption: `${m.aggregation.charAt(0).toUpperCase() + m.aggregation.slice(1)} of ${m.column.split('.').pop()}`
        }))
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none">
            <h3 className="text-lg font-semibold text-center py-2">
                {config.name || "Tabla Dinámica"}
            </h3>
            <CardContent className="flex-grow p-0">
                <Pivot
                    toolbar={isPreview}
                    width="100%" 
                    height="100%" 
                    report={report}
                />
            </CardContent>
        </Card>
    );
};
