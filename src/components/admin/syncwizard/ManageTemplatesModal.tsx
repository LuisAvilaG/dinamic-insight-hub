// /components/wizards/add-sync/ManageTemplatesModal.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { TemplatesPanel } from './TemplatesPanel';

// Definimos las props que necesita el modal, que son casi las mismas que las de TemplatesPanel
interface ManageTemplatesModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    // Todas las props que TemplatesPanel necesita
    listTypeGroups: any[];
    activeMappings: Set<string>;
    listExclusions: Set<string>;
    onConfigure: (group: any) => void;
    onToggleActive: (typeName: string, checked: boolean) => void;
    onMoveList: (listId: string, sourceGroup: string, destGroup: string) => void;
    onToggleListExclusion: (listId: string, isExcluded: boolean) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
}

export const ManageTemplatesModal: React.FC<ManageTemplatesModalProps> = (props) => {
    const { isOpen, onOpenChange, ...templatesPanelProps } = props;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Gestión de Plantillas</DialogTitle>
                    <DialogDescription>Vista expandida para gestionar las plantillas detectadas.</DialogDescription>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto pr-4">
                    <TemplatesPanel {...templatesPanelProps} isModal={true} />
                </div>
                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};