
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface BarChartConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

export const BarChartConfig: React.FC<BarChartConfigProps> = ({ config, onChange }) => {
    const [allTables, setAllTables] = useState<{ value: string; label: string }[]>([]);
    const [availableColumns, setAvailableColumns] = useState<{ value: string; label: string; data_type: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const selectedTables = config?.tables || [];
    const xAxis = config?.xAxis || '';
    const yAxis = config?.yAxis || '';
    const aggregation = config?.aggregation || '';

    const fetchAllColumns = async () => {
        if (selectedTables.length === 0) {
            setAvailableColumns([]);
            return;
        }
        const { data: tableColumns, error: tableError } = await supabase.rpc('get_columns_from_tables', { p_tables: selectedTables });
        if (tableError) { console.error("Error fetching table columns:", tableError); return; }
        
        const { data: calcFields, error: calcError } = await supabase.rpc('get_calculated_fields');
        if (calcError) { console.error("Error fetching calculated fields:", calcError); return; }

        const filteredCalcFields = calcFields.filter(field => field.tables_used.every((table: string) => selectedTables.includes(table)));
        const combined = [
            ...tableColumns.map(c => ({ value: c.display_name, label: c.display_name, data_type: c.data_type })),
            ...filteredCalcFields.map(f => ({ value: f.name, label: `${f.name} (Calculado)`, data_type: 'calculated' }))
        ];
        setAvailableColumns(combined);
    };

    useEffect(() => {
        supabase.rpc('get_schema_tables').then(({ data }) => {
            if (data) setAllTables(data.map(t => ({ value: `${t.table_schema}.${t.table_name}`, label: `${t.table_schema}.${t.table_name}` })));
        });
    }, []);

    const tablesKey = JSON.stringify(selectedTables);
    useEffect(() => {
        fetchAllColumns();
    }, [tablesKey]);

    const handleTablesChange = (values: string[]) => {
        onChange({ ...config, tables: values, xAxis: '', yAxis: '', aggregation: '' });
    };
    const handleAggregationChange = (value: string) => onChange({ ...config, aggregation: value });
    const handleXAxisChange = (value: string) => onChange({ ...config, xAxis: value });
    const handleYAxisChange = (value: string) => onChange({ ...config, yAxis: value });
    
    const numericTypes = ['integer', 'bigint', 'numeric', 'real', 'double precision', 'smallint', 'calculated'];
    const filteredYAxisColumns = aggregation === 'count' 
        ? availableColumns 
        : availableColumns.filter(c => numericTypes.includes(c.data_type));

    return (
        <div className="space-y-4">
            <div>
                <Label>Tablas</Label>
                <MultiSelect options={allTables} selected={selectedTables} onChange={handleTablesChange} className="w-full" placeholder="Seleccione una o más tablas..."/>
            </div>

            {selectedTables.length > 0 && (
                <>
                    <div>
                        <Label>Eje X (Categoría)</Label>
                        <Select onValueChange={handleXAxisChange} value={xAxis}>
                            <SelectTrigger><SelectValue placeholder="Seleccione una columna" /></SelectTrigger>
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
                            <SelectTrigger><SelectValue placeholder="Seleccione una agregación" /></SelectTrigger>
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
                            <SelectTrigger><SelectValue placeholder="Seleccione una columna" /></SelectTrigger>
                            <SelectContent>
                                {aggregation === 'count' && <SelectItem value="*">* (Todas las filas)</SelectItem>}
                                {filteredYAxisColumns.map(col => (
                                    <SelectItem key={col.value} value={col.value}>{col.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => setIsModalOpen(true)}>
                            <PlusCircle className="h-4 w-4 mr-2"/>
                            Nuevo Campo Calculado
                        </Button>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <CreateEditFieldModal 
                            selectedTables={selectedTables} 
                            onSave={() => {
                                fetchAllColumns();
                                setIsModalOpen(false);
                            }} 
                        />
                    </Dialog>
                </>
            )}
        </div>
    );
};

const CreateEditFieldModal = ({ selectedTables, onSave }: { selectedTables: string[], onSave: () => void }) => {
    // ... (This modal component is identical to the one in the other config files)
    const [name, setName] = useState('');
    const [expression, setExpression] = useState('');
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleValidate = async () => {
        if (!expression) {
            toast({ title: "Error", description: "La expresión no puede estar vacía.", variant: "destructive" });
            return;
        }
        setValidationStatus('validating');
        setValidationError(null);
        const { data, error } = await supabase.rpc('validate_sql_expression', { p_expression: expression, p_tables: selectedTables });
        if (error || !data.valid) {
            setValidationStatus('invalid');
            setValidationError(data.error || 'Error desconocido.');
        } else {
            setValidationStatus('valid');
        }
    };

    const handleSave = async () => {
        if (validationStatus !== 'valid' || !name) {
             toast({ title: "Error", description: "El nombre y una expresión válida son obligatorios.", variant: "destructive" });
            return;
        }
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            toast({ title: "Error", description: "No se pudo autenticar al usuario.", variant: "destructive" });
            setIsSaving(false);
            return;
        }
        const { error } = await supabase.from('calculated_fields').insert({ name, expression, tables_used: selectedTables, user_id: user.id });
        if (error) {
            toast({ title: "Error", description: `No se pudo guardar el campo: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Campo calculado guardado." });
            onSave();
        }
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader><DialogTitle>Crear Nuevo Campo Calculado</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Campo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tareas Completadas" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expression">Expresión SQL</Label>
                    <Textarea id="expression" value={expression} onChange={(e) => { setExpression(e.target.value); setValidationStatus('idle'); }} placeholder="CASE WHEN status = 'complete' THEN 1 ELSE 0 END" />
                </div>
                {validationStatus === 'invalid' && <div className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-2"/><p className="text-sm">{validationError}</p></div>}
                {validationStatus === 'valid' && <div className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-2"/><p className="text-sm">La expresión es válida.</p></div>}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handleValidate} disabled={validationStatus === 'validating'}>{validationStatus === 'validating' ? <Loader2 className="h-4 w-4 animate-spin"/> : "Validar"}</Button>
                <Button onClick={handleSave} disabled={isSaving || validationStatus !== 'valid'}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : "Guardar Campo"}</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default BarChartConfig;
