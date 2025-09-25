// /components/wizards/add-sync/ConfigureColumnsModal.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { MANDATORY_FIELDS } from './utils'; // Importamos las constantes que necesitamos

// --- Definiciones de Tipos para las Props ---

interface Field {
    id: string;
    name: string;
    custom: boolean;
}

interface FieldGroup {
    name: string;
    fields: Field[];
}

interface EditingItem {
    id: string;
    name?: string;
    typeName?: string;
}

interface ConfigureColumnsModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    isLoading: boolean;
    item: EditingItem | null;
    fieldGroups: FieldGroup[];
    // Pasamos solo el Set de campos para el item actual, simplificando la lógica.
    selectedFields: Set<string> | undefined; 
    onFieldSelect: (fieldId: string, isSelected: boolean) => void;
}

export const ConfigureColumnsModal: React.FC<ConfigureColumnsModalProps> = ({
    isOpen,
    onOpenChange,
    isLoading,
    item,
    fieldGroups,
    selectedFields,
    onFieldSelect
}) => {
    if (!item) return null; // No renderizar nada si no hay un item para editar

    const handleSave = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Configurar Columnas para: <span className="capitalize font-bold">{item.typeName || item.name}</span>
                    </DialogTitle>
                    <DialogDescription>
                        Selecciona los campos que deseas sincronizar para esta plantilla o lista.
                    </DialogDescription>
                </DialogHeader>

                <div className="max-h-[50vh] overflow-y-auto p-1 pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full min-h-[200px]">
                            <Loader2 className="mr-2 h-6 w-6 animate-spin"/>Cargando Campos...
                        </div>
                    ) : (
                        fieldGroups.map(group => (
                            group.fields.length > 0 && 
                            <div key={group.name} className="mb-4">
                                <h4 className="font-semibold text-sm mb-2 pb-1 border-b">{group.name}</h4>
                                <div className="space-y-2">
                                    {group.fields.map(field => {
                                        const isMandatory = MANDATORY_FIELDS.has(field.name);
                                        const isChecked = isMandatory || selectedFields?.has(field.id) || false;

                                        return (
                                            <div key={field.id} className="flex items-center space-x-2">
                                                <Checkbox 
                                                    id={`field-${field.id}`} 
                                                    onCheckedChange={(checked) => onFieldSelect(field.id, !!checked)} 
                                                    checked={isChecked} 
                                                    disabled={isMandatory}
                                                />
                                                <Label 
                                                    htmlFor={`field-${field.id}`} 
                                                    className={`font-normal ${isMandatory ? 'text-muted-foreground' : ''}`}
                                                >
                                                    {field.name} {isMandatory && '(obligatorio)'}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Guardar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};