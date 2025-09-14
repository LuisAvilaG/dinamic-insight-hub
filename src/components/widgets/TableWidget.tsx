
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TableWidgetProps {
    query: string;
    title: string;
}

interface QueryResult {
    [key: string]: any;
}

export const TableWidget = ({ query, title }: TableWidgetProps) => {
    const [data, setData] = useState<QueryResult[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [headers, setHeaders] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!query) return;

            setData(null);
            setError(null);
            setHeaders([]);

            try {
                const { data: resultData, error: rpcError } = await supabase.rpc('execute_query', { p_query: query });

                if (rpcError) {
                    throw rpcError;
                }

                if (resultData && resultData.length > 0) {
                    setData(resultData);
                    setHeaders(Object.keys(resultData[0]));
                } else {
                    setData([]);
                }

            } catch (err: any) {
                setError(`Error al ejecutar la consulta: ${err.message}`);
                console.error(err);
            }
        };

        fetchData();
    }, [query]);

    return (
        <Card className="h-full w-full flex flex-col">
            <CardHeader>
                <CardTitle className="text-base font-medium widget-drag-handle cursor-move">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-auto">
                 {error && <div className="text-red-500 text-sm p-4 bg-red-100 rounded-md h-full">{error}</div>}
                {!error && data === null && <div className="flex items-center justify-center h-full">Cargando...</div>}
                {!error && data && data.length === 0 && <div className="flex items-center justify-center h-full">No se encontraron resultados.</div>}
                {!error && data && data.length > 0 && (
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
                )}
            </CardContent>
        </Card>
    );
};
