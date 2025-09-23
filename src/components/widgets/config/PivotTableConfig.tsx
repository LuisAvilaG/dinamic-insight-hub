
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from '@/components/ui/multi-select';
import { Label } from '@/components/ui/label';

type CalculatedField = { name: string; expression: string; tables_used: string[] };

interface PivotTableConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
    calculatedFields?: CalculatedField[]; // <-- Aceptar campos calculados
}

// Helper para saber si un campo calculado ya es una agregación
const isAggregateExpression = (expression: string): boolean => {
    if (!expression) return false;
    const upperExpr = expression.toUpperCase();
    return upperExpr.includes('COUNT(') || upperExpr.includes('SUM(') || upperExpr.includes('AVG(') || upperExpr.includes('MIN(') || upperExpr.includes('MAX(');
};

export const PivotTableConfig: React.FC<PivotTableConfigProps> = ({ config, onChange, calculatedFields = [] }) => {
    const [allTables, setAllTables] = useState<{ value: string; label: string }[]>([]);
    const [tableColumns, setTableColumns] = useState<{ value: string; label: string }[]>([]);

    const selectedTable = config?.tables?.[0] || null;

    useEffect(() => {
        supabase.rpc('get_schema_tables').then(({ data }) => {
            if (data) {
                const formattedTables = data.map(t => ({ 
                    value: `${t.table_schema}.${t.table_name}`, 
                    label: `${t.table_schema}.${t.table_name}` 
                }));
                setAllTables(formattedTables);
            }
        });
    }, []);

    useEffect(() => {
        const fetchColumns = async () => {
            if (!selectedTable) {
                setTableColumns([]);
                return;
            }

            // Usamos una RPC más robusta que devuelva tipos de datos si es posible
            const { data, error } = await supabase.rpc('get_columns_from_tables', { p_tables: [selectedTable] });
            
            if (error) {
                console.error("Error fetching columns:", error);
                setTableColumns([]);
                return;
            }
            
            if (data) {
                const allCols = data.map((c: any) => ({ value: c.display_name, label: c.display_name }));
                setTableColumns(allCols);
            }
        };

        fetchColumns();
    }, [selectedTable]);
    
    // Unir columnas de la tabla y campos calculados para selectores de Filas y Columnas
    const availableFields = useMemo(() => {
        const calculatedOptions = calculatedFields
            .filter(cf => !isAggregateExpression(cf.expression)) // Excluir agregados de filas/columnas
            .map(cf => ({ value: cf.name, label: `${cf.name} (Calc)` }));
        return [...tableColumns, ...calculatedOptions];
    }, [tableColumns, calculatedFields]);

    // Opciones para Medidas: AHORA INCLUYE TODAS LAS COLUMNAS Y CAMPOS CALCULADOS
    const measureOptions = useMemo(() => {
        const calculatedOptions = calculatedFields.map(cf => ({
            value: cf.name,
            label: `${cf.name} (Calc)`,
            isAggregate: isAggregateExpression(cf.expression)
        }));
        // Ya no filtramos por numérico para arreglar el bug de la lista vacía
        return [...tableColumns.map(c => ({...c, isAggregate: false})), ...calculatedOptions];
    }, [tableColumns, calculatedFields]);


    const handleTableChange = (newTable: string) => {
        onChange({
            ...config,
            tables: newTable ? [newTable] : [],
            rows: [],
            columns: [],
            measures: []
        });
    };

    const handleUpdate = (key: string, value: any) => {
        onChange({ ...config, [key]: value });
    };

    const addMeasure = () => {
        const newMeasure = { column: '', aggregation: 'sum' };
        handleUpdate('measures', [...(config.measures || []), newMeasure]);
    };

    const updateMeasure = (index: number, key: 'column' | 'aggregation', value: string) => {
        const newMeasures = [...(config.measures || [])];
        const measureToUpdate = { ...newMeasures[index], [key]: value };
        
        const selectedOption = measureOptions.find(opt => opt.value === measureToUpdate.column);
        if (selectedOption?.isAggregate) {
            measureToUpdate.aggregation = ''; // Es un campo calculado agregado, no necesita otra agregación
        } else if (!measureToUpdate.aggregation) {
             measureToUpdate.aggregation = 'sum'; // Default si no es un campo agregado
        }

        newMeasures[index] = measureToUpdate;
        handleUpdate('measures', newMeasures);
    };

    const removeMeasure = (index: number) => {
        const newMeasures = (config.measures || []).filter((_: any, i: number) => i !== index);
        handleUpdate('measures', newMeasures);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Tabla (Fuente Principal)</Label>
                <Select value={selectedTable || ''} onValueChange={handleTableChange}>
                    <SelectTrigger><SelectValue placeholder="Seleccione una tabla..." /></SelectTrigger>
                    <SelectContent>{allTables.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            
            {selectedTable && (
                <>
                    <div>
                        <Label>Filas (Rows)</Label>
                        <MultiSelect 
                            options={availableFields} 
                            selected={config.rows || []} 
                            onChange={(v) => handleUpdate('rows', v)} 
                            className="w-full" 
                            placeholder="Seleccione campos para las filas..."
                        />
                    </div>
                    <div>
                        <Label>Columnas (Columns)</Label>
                        <MultiSelect 
                            options={availableFields} 
                            selected={config.columns || []} 
                            onChange={(v) => handleUpdate('columns', v)} 
                            className="w-full" 
                            placeholder="Seleccione campos para las columnas..."
                        />
                    </div>
                    <div>
                        <Label>Medidas (Measures)</Label>
                        <div className="space-y-2 rounded-md border p-2">
                            {(config.measures || []).map((measure: any, index: number) => {
                                const selectedMeasure = measureOptions.find(opt => opt.value === measure.column);
                                const isAggregateCalc = selectedMeasure?.isAggregate;

                                return (
                                    <div key={index} className="flex items-center gap-2">
                                        <div className="flex-1 min-w-0">
                                            <Select 
                                                value={measure.column} 
                                                onValueChange={(v) => updateMeasure(index, 'column', v)}
                                            >
                                                <SelectTrigger className="truncate">
                                                    <SelectValue placeholder="Columna o Campo Calculado..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {measureOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        
                                        {!isAggregateCalc && (
                                            <div className="w-auto">
                                                <Select 
                                                    value={measure.aggregation} 
                                                    onValueChange={(v) => updateMeasure(index, 'aggregation', v)}
                                                >
                                                    <SelectTrigger><SelectValue placeholder="Agregación..." /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="sum">Suma</SelectItem>
                                                        <SelectItem value="count">Recuento</SelectItem>
                                                        <SelectItem value="avg">Promedio</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={() => removeMeasure(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500"/>
                                        </Button>
                                    </div>
                                );
                            })}
                            <Button variant="outline" size="sm" className="w-full" onClick={addMeasure}>
                                <PlusCircle className="h-4 w-4 mr-2"/>Añadir Medida
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
