
import React, { useState, useEffect, useRef } from 'react';
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
    const pivotRef = useRef<any>(null);
    const { config } = widget;

    useEffect(() => {
        const fetchData = async () => {
            if (!config.query) {
                setIsLoading(false);
                setViewData([]);
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
        slice: {},
        options: {
            grid: {
                type: "flat",
                showGrandTotals: "off",
            }
        }
    };

    const customizeToolbar = (toolbar: any) => {
        const tabs = toolbar.getTabs();
        toolbar.getTabs = () => {
            return tabs.filter((tab: any) => tab.id !== "wdr-tab-fields");
        };
    };

    return (
        <Card className="h-full flex flex-col border-none shadow-none">
            <CardHeader>
                <CardTitle>{config.name || "Tabla de Datos"}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow p-0">
                <Pivot
                    ref={pivotRef}
                    toolbar={true}
                    beforetoolbarcreated={customizeToolbar}
                    width="100%" 
                    height="100%" 
                    report={report}
                />
            </CardContent>
        </Card>
    );
};
