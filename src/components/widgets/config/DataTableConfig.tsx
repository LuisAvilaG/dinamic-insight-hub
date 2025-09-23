
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, CheckCircle, XCircle, ClipboardCopy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DataTableConfigProps {
    config: any;
    onChange: (newConfig: any) => void;
}

const AGGREGATE_FUNCTIONS = ['COUNT(', 'SUM(', 'AVG(', 'MIN(', 'MAX('];

export const DataTableConfig: React.FC<DataTableConfigProps> = ({ config, onChange }) => {
    const [allTables, setAllTables] = useState<{ value: string; label: string }[]>([]);
    const [availableColumns, setAvailableColumns] = useState<{ value: string; label: string; data_type: string, isAggregate: boolean }[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const selectedTables = config?.tables || [];
    const selectedColumns = config?.columns || [];

    const fetchAllColumns = async () => {
        if (selectedTables.length === 0) {
            setAvailableColumns([]);
            return;
        }
        const { data: tableColumns, error: tableError } = await supabase.rpc('get_columns_from_tables', { p_tables: selectedTables });
        if (tableError) { console.error("Error fetching table columns:", tableError); return; }
        
        const { data: calcFields, error: calcError } = await supabase.rpc('get_calculated_fields');
        if (calcError) { console.error("Error fetching calculated fields:", calcError); return; }

        const relevantCalcFields = calcFields.filter(field => 
            field.tables_used.every((table: string) => selectedTables.includes(table))
        );
        
        // **FILTRO INTELIGENTE AÑADIDO AQUÍ**
        // Excluimos los campos calculados que son agregaciones, porque este widget es una "tabla plana".
        const nonAggregateCalcFields = relevantCalcFields.filter(field => 
            !AGGREGATE_FUNCTIONS.some(agg => field.expression.toUpperCase().includes(agg))
        );

        const combined = [
            ...tableColumns.map(c => ({ 
                value: c.display_name, 
                label: c.display_name, 
                data_type: c.data_type,
                isAggregate: false 
            })),
            // Usamos la lista ya filtrada
            ...nonAggregateCalcFields.map(f => ({ 
                value: f.name, 
                label: `${f.name} (Calculado)`, 
                data_type: 'calculated',
                isAggregate: false // Se asume false porque ya hemos filtrado las agregaciones
            }))
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
        onChange({ ...config, tables: values, columns: [] });
    };
    
    const handleColumnChange = (values: string[]) => {
        onChange({ ...config, columns: values });
    };

    return (
        <div className="space-y-4">
            <div>
                <Label>Tablas</Label>
                <MultiSelect options={allTables} selected={selectedTables} onChange={handleTablesChange} className="w-full" placeholder="Seleccione una o más tablas..."/>
            </div>

            {selectedTables.length > 0 && (
                <>
                    <div>
                        <Label>Columnas a mostrar</Label>
                        <MultiSelect 
                            options={availableColumns.map(c => ({ value: c.value, label: c.label }))}
                            selected={selectedColumns}
                            onChange={handleColumnChange}
                            className="w-full"
                            placeholder="Seleccione las columnas..."
                        />
                    </div>
                    
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="w-full mt-2">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Crear o Gestionar Campos Calculados
                            </Button>
                        </DialogTrigger>
                        <CreateEditFieldModal 
                            selectedTables={selectedTables} 
                            availableColumns={availableColumns.map(c => ({ value: c.value, label: c.label }))}
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

// El resto del componente (CreateEditFieldModal) permanece sin cambios.

const CreateEditFieldModal = ({ selectedTables, availableColumns, onSave }: { selectedTables: string[], availableColumns: {value: string, label: string}[], onSave: () => void }) => {
    const [name, setName] = useState('');
    const [expression, setExpression] = useState('');
    const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    const handleEditorMount: OnMount = (editor, monaco) => {
        const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AND', 'OR', 'NOT', 'IN', 'IS', 'NULL'];
        const functions = ['SUM', 'AVG', 'COUNT', 'MIN', 'MAX', 'CAST'];
        
        const columnSuggestions = availableColumns.map(col => ({
            label: `"${col.label}"`,
            kind: monaco.languages.CompletionItemKind.Field,
            insertText: `"${col.value}"`,
            documentation: `Columna de tabla`
        }));

        const keywordSuggestions = keywords.map(keyword => ({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: keyword,
        }));
        
        const functionSuggestions = functions.map(func => ({
            label: `${func}()`,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: `${func}($1)`,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: `Función SQL ${func}`
        }));

        monaco.languages.registerCompletionItemProvider('sql', {
            provideCompletionItems: (model, position) => {
                return {
                    suggestions: [...columnSuggestions, ...keywordSuggestions, ...functionSuggestions],
                };
            },
        });
    };

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
        
        const { error } = await supabase.rpc('create_calculated_field', {
            p_name: name,
            p_expression: expression,
            p_tables_used: selectedTables
        });

        if (error) {
            toast({ title: "Error", description: `No se pudo guardar el campo: ${error.message}`, variant: "destructive" });
        } else {
            toast({ title: "Éxito", description: "Campo calculado guardado." });
            onSave();
        }
        setIsSaving(false);
    };
    
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(`"${text}"`);
        toast({ title: "Copiado", description: `"${text}" copiado al portapapeles.`});
    };

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Crear Nuevo Campo Calculado</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="md:col-span-1">
                    <h4 className="font-semibold mb-2">Columnas Disponibles</h4>
                    <div className="h-64 overflow-y-auto border rounded-md p-2 bg-slate-50 custom-scrollbar">
                        <TooltipProvider>
                            <ul className="space-y-1">
                                {availableColumns.map(col => (
                                    <li key={col.value} className="flex justify-between items-center text-sm p-1 rounded hover:bg-slate-200">
                                        <Tooltip delayDuration={300}>
                                            <TooltipTrigger asChild>
                                                <span className="truncate cursor-default">{col.label}</span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{col.label}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={() => copyToClipboard(col.value)}>
                                            <ClipboardCopy className="h-4 w-4"/>
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </TooltipProvider>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre del Campo</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Margen de Beneficio" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="expression">Expresión SQL</Label>
                        <div className="border rounded-md">
                            <Editor
                                height="155px"
                                defaultLanguage="sql"
                                value={expression}
                                onChange={(value) => { setExpression(value || ''); setValidationStatus('idle'); }}
                                onMount={handleEditorMount}
                                options={{ minimap: { enabled: false }, scrollbar: { verticalScrollbarSize: 5 }, 'semanticHighlighting.enabled': true }}
                            />
                        </div>
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

export default DataTableConfig;
