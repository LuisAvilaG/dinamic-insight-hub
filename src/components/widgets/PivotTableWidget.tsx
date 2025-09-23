
import React, { useState, useEffect, useRef } from 'react';
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
    const pivotRef = useRef<any>(null);
    const { config } = widget;

    useEffect(() => {
        const fetchData = async () => {
            if (!config.query) {
                setError("La configuración del widget está incompleta.");
                setIsLoading(false);
                setViewData([]);
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

    // **ROBUST CLEANUP EFFECT**
    useEffect(() => {
        // This effect only returns a cleanup function, which runs on unmount.
        return () => {
            // Access the ref's current value at the time of cleanup.
            if (pivotRef.current && pivotRef.current.webdatarocks) {
                const pivotInstance = pivotRef.current.webdatarocks;
                try {
                    // Gracefully handle fullscreen mode before disposing.
                    if (pivotInstance.isFullScreen()) {
                        pivotInstance.closeFullscreen();
                    }
                    // Dispose the instance to prevent memory leaks and errors.
                    pivotInstance.dispose();
                } catch (e) {
                    // Errors during cleanup can happen if the component is already gone,
                    // so we can safely ignore them.
                    console.warn("Harmless error during WebDataRocks cleanup:", e);
                }
            }
        };
    }, []); // Empty dependency array ensures this runs only once on mount and unmount.

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
        slice: {
            rows: config.rows?.map(r => ({ uniqueName: r })),
            columns: config.columns?.map(c => ({ uniqueName: c })),
            measures: config.measures?.map(m => ({
                uniqueName: `${m.aggregation}_of_${m.column}`,
                aggregation: "sum"
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
                    ref={pivotRef}
                    toolbar={isPreview}
                    width="100%" 
                    height="100%" 
                    report={report}
                />
            </CardContent>
        </Card>
    );
};
