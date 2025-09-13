
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableWidgetProps {
    query: string;
}

interface QueryResult {
    [key: string]: any;
}

export const TableWidget = ({ query }: TableWidgetProps) => {
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
                // *** CORRECCIÓN ***: Usando p_query y el esquema public por defecto
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

    if (error) {
        return <div className="text-red-500 text-sm p-4 bg-red-100 rounded-md">{error}</div>;
    }

    if (data === null) {
        return <div>Cargando...</div>;
    }

    if (data.length === 0) {
        return <div>No se encontraron resultados.</div>;
    }

    return (
        <div className="overflow-auto max-h-96">
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
        </div>
    );
};
