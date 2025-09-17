
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BarChartConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

const BarChartConfig: React.FC<BarChartConfigProps> = ({ config, onChange }) => {
    const [allTables, setAllTables] = useState<{ value: string; label: string }[]>([]);
    const [availableColumns, setAvailableColumns] = useState<{ value: string; label: string; data_type: string }[]>([]);
    
    const selectedTables = config?.tables || [];
    const xAxis = config?.xAxis || '';
    const yAxis = config?.yAxis || '';
    const aggregation = config?.aggregation || '';

    // Cargar todas las tablas disponibles
    useEffect(() => {
        supabase.rpc('get_schema_tables').then(({ data }) => {
            if (data) {
                setAllTables(data.map(t => ({ value: `${t.table_schema}.${t.table_name}`, label: `${t.table_schema}.${t.table_name}` })));
            }
        });
    }, []);

    // Cargar columnas cuando cambian las tablas seleccionadas
    const tablesKey = JSON.stringify(selectedTables);
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
                        label: c.display_name,
                        data_type: c.data_type
                    })));
                }
            });
        } else {
            setAvailableColumns([]);
        }
    }, [tablesKey]);

    const handleTablesChange = (values: string[]) => {
        onChange({ tables: values, xAxis: '', yAxis: '', aggregation: '' });
    };

    const handleAggregationChange = (value: string) => {
        onChange({ aggregation: value });
    };
    
    const handleXAxisChange = (value: string) => {
        onChange({ xAxis: value });
    };

    const handleYAxisChange = (value: string) => {
        onChange({ yAxis: value });
    };
    
    const numericTypes = ['integer', 'bigint', 'numeric', 'real', 'double precision', 'smallint'];
    const filteredYAxisColumns = aggregation === 'count' 
        ? availableColumns 
        : availableColumns.filter(c => numericTypes.includes(c.data_type));

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
                <>
                    <div>
                        <Label>Eje X (Categoría)</Label>
                        <Select onValueChange={handleXAxisChange} value={xAxis}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una columna" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableColumns.map(col => (
                                    <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Agregación (Eje Y)</Label>
                        <Select onValueChange={handleAggregationChange} value={aggregation}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una agregación" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="count">Recuento (Count)</SelectItem>
                                <SelectItem value="sum">Suma (Sum)</SelectItem>
                                <SelectItem value="avg">Promedio (Average)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Columna del Eje Y</Label>
                        <Select onValueChange={handleYAxisChange} value={yAxis}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione una columna" />
                            </SelectTrigger>
                            <SelectContent>
                                {aggregation === 'count' && <SelectItem value="*">* (Todas las filas)</SelectItem>}
                                {filteredYAxisColumns.map(col => (
                                    <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </>
            )}
        </div>
    );
};

export default BarChartConfig;
