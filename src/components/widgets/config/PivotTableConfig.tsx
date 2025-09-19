
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select'; 
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface PivotTableConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

export const PivotTableConfig: React.FC<PivotTableConfigProps> = ({ config, onChange }) => {
    const [allTables, setAllTables] = useState<{ value: string; label: string }[]>([]);
    const [availableColumns, setAvailableColumns] = useState<{ value: string; label: string }[]>([]);
    const [numericColumns, setNumericColumns] = useState<{ value: string; label: string }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const selectedTables = config?.tables || [];
    const rows = config?.rows || [];
    const columns = config?.columns || [];
    const measures = config?.measures || [];

    const fetchAllColumns = async () => {
        if (selectedTables.length === 0) {
            setAvailableColumns([]);
            setNumericColumns([]);
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
        
        setAvailableColumns(combined.map(({ value, label }) => ({ value, label })));
        const numericDataTypes = ['integer', 'bigint', 'numeric', 'real', 'double precision', 'smallint'];
        setNumericColumns(combined.filter(c => numericDataTypes.includes(c.data_type) || c.data_type === 'calculated').map(({ value, label }) => ({ value, label })));
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

    const handleUpdate = (key: string, value: any) => {
        onChange({ ...config, [key]: value });
    };

    const addMeasure = () => {
        const newMeasure = { column: '', aggregation: 'sum' };
        handleUpdate('measures', [...measures, newMeasure]);
    };

    const updateMeasure = (index: number, newMeasure: any) => {
        const newMeasures = [...measures];
        newMeasures[index] = newMeasure;
        handleUpdate('measures', newMeasures);
    };

    const removeMeasure = (index: number) => {
        const newMeasures = measures.filter((_: any, i: number) => i !== index);
        handleUpdate('measures', newMeasures);
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Tablas</Label>
                <MultiSelect options={allTables} selected={selectedTables} onChange={(v) => handleUpdate('tables', v)} className="w-full" placeholder="Seleccione una o más tablas..."/>
            </div>
            {selectedTables.length > 0 && (
                <>
                    <div>
                        <Label>Filas (Rows)</Label>
                        <MultiSelect options={availableColumns} selected={rows} onChange={(v) => handleUpdate('rows', v)} className="w-full" placeholder="Seleccione campos para las filas..."/>
                    </div>
                    <div>
                        <Label>Columnas (Columns)</Label>
                        <MultiSelect options={availableColumns} selected={columns} onChange={(v) => handleUpdate('columns', v)} className="w-full" placeholder="Seleccione campos para las columnas..."/>
                    </div>
                    <div>
                        <Label>Medidas (Measures)</Label>
                        <div className="space-y-2 rounded-md border p-2">
                            {measures.map((measure: any, index: number) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Select value={measure.column} onValueChange={(v) => updateMeasure(index, { ...measure, column: v })}>
                                        <SelectTrigger><SelectValue placeholder="Columna..." /></SelectTrigger>
                                        <SelectContent>{numericColumns.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <Select value={measure.aggregation} onValueChange={(v) => updateMeasure(index, { ...measure, aggregation: v })}>
                                        <SelectTrigger><SelectValue placeholder="Agregación..." /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="sum">Suma</SelectItem>
                                            <SelectItem value="count">Recuento</SelectItem>
                                            <SelectItem value="average">Promedio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button variant="ghost" size="icon" onClick={() => removeMeasure(index)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" className="w-full" onClick={addMeasure}><PlusCircle className="h-4 w-4 mr-2"/>Añadir Medida</Button>
                        </div>
                    </div>
                    <div>
                        <Label>Campos Calculados</Label>
                        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full mt-1">
                                    <PlusCircle className="h-4 w-4 mr-2" />
                                    Crear o Gestionar Campos
                                </Button>
                            </DialogTrigger>
                            <CreateEditFieldModal 
                                selectedTables={selectedTables} 
                                onSave={() => {
                                    fetchAllColumns();
                                    setIsModalOpen(false);
                                }} 
                            />
                        </Dialog>
                    </div>
                </>
            )}
        </div>
    );
};

// ... (CreateEditFieldModal sigue siendo el mismo)
const CreateEditFieldModal = ({ selectedTables, onSave }: { selectedTables: string[], onSave: () => void }) => {
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

        const { data, error } = await supabase.rpc('validate_sql_expression', {
            p_expression: expression,
            p_tables: selectedTables
        });

        if (error || !data.valid) {
            setValidationStatus('invalid');
            setValidationError(data.error || 'Error desconocido.');
        } else {
            setValidationStatus('valid');
        }
    };

    const handleSave = async () => {
        if (validationStatus !== 'valid') {
            toast({ title: "Error", description: "La expresión debe ser validada antes de guardar.", variant: "destructive" });
            return;
        }
        if (!name) {
            toast({ title: "Error", description: "El nombre del campo es obligatorio.", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
            toast({ title: "Error", description: "No se pudo autenticar al usuario.", variant: "destructive" });
            setIsSaving(false);
            return;
        }

        const { error } = await supabase.from('calculated_fields').insert({
            name,
            expression,
            tables_used: selectedTables,
            user_id: userData.user.id
        });

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
            <DialogHeader>
                <DialogTitle>Crear Nuevo Campo Calculado</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Campo</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Tareas Completadas" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="expression">Expresión SQL</Label>
                    <Textarea id="expression" value={expression} onChange={(e) => { setExpression(e.target.value); setValidationStatus('idle'); }} placeholder="CASE WHEN status = 'complete' THEN 1 ELSE 0 END" />
                </div>
                
                {validationStatus === 'invalid' && (
                    <div className="flex items-center text-red-600">
                        <XCircle className="h-4 w-4 mr-2"/>
                        <p className="text-sm">{validationError}</p>
                    </div>
                )}
                {validationStatus === 'valid' && (
                     <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2"/>
                        <p className="text-sm">La expresión es válida.</p>
                    </div>
                )}

            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handleValidate} disabled={validationStatus === 'validating'}>
                    {validationStatus === 'validating' ? <Loader2 className="h-4 w-4 animate-spin"/> : "Validar"}
                </Button>
                <Button onClick={handleSave} disabled={isSaving || validationStatus !== 'valid'}>
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin"/> : "Guardar Campo"}
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default PivotTableConfig;
