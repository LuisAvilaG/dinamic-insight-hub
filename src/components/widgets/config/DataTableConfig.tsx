
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from '@/components/ui/multi-select'; 

interface DataTableConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

const DataTableConfig: React.FC<DataTableConfigProps> = ({ config, onChange }) => {
    const [tables, setTables] = useState<{ table_schema: string; table_name: string }[]>([]);
    const [columns, setColumns] = useState<{ column_name: string; data_type: string }[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

    useEffect(() => {
        supabase.rpc('get_schema_tables').then(({ data }) => {
            if (data) setTables(data);
        });
    }, []);

    useEffect(() => {
        if (config?.schema && config?.table) {
            const tableIdentifier = JSON.stringify([config.schema, config.table]);
            setSelectedTable(tableIdentifier);
            loadColumns(config.schema, config.table);
        }
        if (config?.columns) {
            setSelectedColumns(config.columns);
        }
    }, [config]);

    const loadColumns = (schema: string, table: string) => {
        supabase.rpc('get_table_columns', { p_schema_name: schema, p_table_name: table }).then(({ data }) => {
            if (data) setColumns(data);
        });
    };

    const handleTableChange = (value: string) => {
        const [schema, table] = JSON.parse(value);
        setSelectedTable(value);
        setSelectedColumns([]);
        onChange({ schema, table, columns: [] });
    };

    const handleColumnChange = (values: string[]) => {
        setSelectedColumns(values);
        if (selectedTable) {
            const [schema, table] = JSON.parse(selectedTable);
            onChange({ schema, table, columns: values });
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Tabla</Label>
                <Select value={selectedTable} onValueChange={handleTableChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleccione una tabla" />
                    </SelectTrigger>
                    <SelectContent>
                        {tables.map(t => (
                            <SelectItem key={`${t.table_schema}.${t.table_name}`} value={JSON.stringify([t.table_schema, t.table_name])}>
                                {t.table_schema}.{t.table_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {selectedTable && (
                <div>
                    <Label>Columnas</Label>
                    <MultiSelect
                        options={columns.map(c => ({ label: c.column_name, value: c.column_name }))}
                        selected={selectedColumns}
                        onChange={handleColumnChange}
                        className="w-full"
                        placeholder="Seleccione columnas..."
                    />
                </div>
            )}
        </div>
    );
};

export default DataTableConfig;
