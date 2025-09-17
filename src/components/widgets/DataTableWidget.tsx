
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Pivot } from '@webdatarocks/react-webdatarocks';
import "@webdatarocks/webdatarocks/webdatarocks.min.css";

interface DataTableWidgetProps {
  widget: {
    config: {
      name?: string;
      query: string;
    }
  };
  isPreview?: boolean;
}

export const DataTableWidget: React.FC<DataTableWidgetProps> = ({ widget, isPreview = false }) => {
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
            try {
                const { data, error } = await supabase.rpc('execute_query', { p_query: config.query });
                if (error) throw error;
                setViewData(data || []);
            } catch (err: any) {
                setError(`Error al cargar datos: ${err.message}`);
                console.error("Error fetching table data:", err);
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
    
    const report = {
        dataSource: {
            data: viewData
        },
        slice: {},
        options: {
            grid: {
                type: "flat",
                showTotals: "off",
                showGrandTotals: "off",
            }
        }
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none">
            <CardHeader>
                <CardTitle>{config.name || "Tabla de Datos"}</CardTitle>
            </CardHeader>
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
