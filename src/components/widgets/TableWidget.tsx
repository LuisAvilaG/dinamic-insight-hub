import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TableWidgetProps {
    // Se acepta un único objeto `config`, alineado con `WidgetRenderer`.
    config: {
        query?: string;
        title?: string;
    };
}

interface QueryResult {
    [key: string]: any;
}

export const TableWidget = ({ config }: TableWidgetProps) => {
    // ========= CORRECCIÓN DE CONTRATO DE DATOS =========
    const { 
        query = '', 
        title = 'Tabla sin título' 
    } = config || {};

    const [data, setData] = useState<QueryResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!query) {
                setError("La consulta (query) no está definida.");
                setData([]);
                return;
            }

            setData(null); // Resetear estado en cada nueva carga
            setError(null);
            setHeaders([]);

            try {
                // Usamos `execute_sql` para consistencia y seguridad.
                const { data: resultData, error: rpcError } = await supabase.rpc('execute_sql', { query });

                if (rpcError) {
                    throw new Error(`Error en la consulta: ${rpcError.message}`);
                }

                if (resultData && resultData.length > 0) {
                    setData(resultData);
                    // Se asegura de que los encabezados se extraigan correctamente.
                    setHeaders(Object.keys(resultData[0]));
                } else {
                    setData([]); // Si no hay datos, se establece un array vacío.
                }

            } catch (err: any) {
                setError(`Error al ejecutar la consulta: ${err.message}`);
                console.error(err);
            }
        };

        fetchData();
    }, [query]);

    const renderContent = () => {
        if (error) {
            return <div className="text-red-500 text-sm p-4 bg-red-100 rounded-md h-full">{error}</div>;
        }
        if (data === null) {
            return <div className="flex items-center justify-center h-full">Cargando...</div>;
        }
        if (data.length === 0) {
            return <div className="flex items-center justify-center h-full">No se encontraron resultados.</div>;
        }
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {headers.map(header => (
                                <TableCell key={`${rowIndex}-${header}`}>{String(row[header])}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-base font-medium widget-drag-handle cursor-move">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                {renderContent()}
            </CardContent>
        </Card>
    );
};
