
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select'; 

interface DataTableConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

const DataTableConfig: React.FC<DataTableConfigProps> = ({ config, onChange }) => {
    const [allTables, setAllTables] = useState<{ value: string; label: string }[]>([]);
    const [availableColumns, setAvailableColumns] = useState<{ value: string; label: string }[]>([]);
    
    const [selectedTables, setSelectedTables] = useState<string[]>(config?.tables || []);
    const [selectedColumns, setSelectedColumns] = useState<string[]>(config?.columns || []);

    // Cargar todas las tablas disponibles al montar el componente
    useEffect(() => {
        supabase.rpc('get_schema_tables').then(({ data }) => {
            if (data) {
                setAllTables(data.map(t => ({
                    value: `${t.table_schema}.${t.table_name}`,
                    label: `${t.table_schema}.${t.table_name}`
                })));
            }
        });
    }, []);

    // Cuando la selección de tablas cambia, cargar las columnas correspondientes
    useEffect(() => {
        if (selectedTables.length > 0) {
            supabase.rpc('get_columns_from_tables', { p_tables: selectedTables }).then(({ data, error }) => {
                if (error) {
                    console.error("Error fetching columns:", error);
                    return;
                }
                if (data) {
                    setAvailableColumns(data.map(c => ({
                        value: c.display_name,
                        label: c.display_name
                    })));
                }
            });
        } else {
            setAvailableColumns([]);
        }
    }, [selectedTables]);

    const handleTablesChange = (values: string[]) => {
        setSelectedTables(values);
        // Limpiar columnas seleccionadas si la lista de tablas cambia
        const newSelectedColumns: string[] = [];
        setSelectedColumns(newSelectedColumns);
        onChange({ tables: values, columns: newSelectedColumns });
    };

    const handleColumnChange = (values: string[]) => {
        setSelectedColumns(values);
        onChange({ tables: selectedTables, columns: values });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Tablas</Label>
                <MultiSelect
                    options={allTables}
                    selected={selectedTables}
                    onChange={handleTablesChange}
                    className="w-full"
                    placeholder="Seleccione una o más tablas..."
                />
            </div>
            {selectedTables.length > 0 && (
                <div>
                    <Label>Columnas</Label>
                    <MultiSelect
                        options={availableColumns}
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
