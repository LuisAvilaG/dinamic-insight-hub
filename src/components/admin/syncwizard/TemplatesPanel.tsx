// /components/wizards/add-sync/TemplatesPanel.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Settings, Move, Expand } from 'lucide-react';

// Definimos la estructura de un grupo de listas para que TypeScript sepa qué esperar.
interface ListGroup {
    typeName: string;
    count: number;
    lists: { id: string; name: string }[];
    sampleListId: string;
}

// Definimos todas las props que el componente necesita para funcionar.
interface TemplatesPanelProps {
    listTypeGroups: ListGroup[];
    activeMappings: Set<string>;
    listExclusions: Set<string>;
    onConfigure: (group: ListGroup) => void;
    onToggleActive: (typeName: string, checked: boolean) => void;
    onMoveList: (listId: string, sourceGroup: string, destGroup: string) => void;
    onToggleListExclusion: (listId: string, isExcluded: boolean) => void;
    onSelectAll: () => void;
    onDeselectAll: () => void;
    onExpand?: () => void; // Opcional, solo para la vista no-modal
    isModal?: boolean; // Opcional, para ajustar estilos
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
    listTypeGroups,
    activeMappings,
    onConfigure,
    onToggleActive,
    onMoveList,
    listExclusions,
    onToggleListExclusion,
    onSelectAll,
    onDeselectAll,
    isModal = false,
    onExpand
}) => (
    <div className={`p-4 border rounded-lg ${isModal ? 'h-full flex flex-col' : ''}`}>
        <div className="flex justify-between items-center mb-2">
            <div>
                <h3 className="font-semibold text-md">Plantillas de Listas Detectadas</h3>
                <p className="text-sm text-muted-foreground">Reorganiza moviendo listas entre grupos si es necesario.</p>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="link" size="sm" onClick={onSelectAll}>Seleccionar Todo</Button>
                <Button variant="link" size="sm" onClick={onDeselectAll}>Deseleccionar Todo</Button>
                {!isModal && onExpand && (
                    <Button variant="ghost" size="icon" onClick={onExpand}>
                        <Expand className="h-4 w-4"/>
                    </Button>
                )}
            </div>
        </div>
        <div className={`space-y-2 pr-2 ${isModal ? 'flex-grow overflow-y-auto' : 'max-h-60 overflow-y-auto'}`}>
            {listTypeGroups.map(group => (
                <Collapsible key={group.typeName} className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-md bg-muted/20">
                        <CollapsibleTrigger asChild>
                            <button className="text-left">
                                <p className="font-medium capitalize">{group.typeName}</p>
                                <p className="text-xs text-muted-foreground">{group.count} lista(s)</p>
                            </button>
                        </CollapsibleTrigger>
                        <div className="flex items-center space-x-3">
                            <Button variant="outline" size="sm" onClick={() => onConfigure(group)} disabled={!activeMappings.has(group.typeName)}>
                                <Settings className="h-4 w-4 mr-2"/>Configurar
                            </Button>
                            <Switch checked={activeMappings.has(group.typeName)} onCheckedChange={(checked) => onToggleActive(group.typeName, checked)}/>
                        </div>
                    </div>
                    <CollapsibleContent className="p-3 pl-6 border-l border-dashed ml-3 space-y-2">
                        {group.lists.map(list => (
                            <div key={list.id} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox 
                                        id={`list-exc-${list.id}`} 
                                        checked={!listExclusions.has(list.id)} 
                                        onCheckedChange={(checked) => onToggleListExclusion(list.id, !checked)} 
                                        disabled={!activeMappings.has(group.typeName)}
                                    />
                                    <Label htmlFor={`list-exc-${list.id}`} className="text-sm font-normal text-muted-foreground">{list.name}</Label>
                                </div>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="sm"><Move className="h-4 w-4 mr-2"/>Mover</Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-56 p-0">
                                        <Command>
                                            <CommandInput placeholder="Mover a..." />
                                            <CommandEmpty>No se encontraron plantillas.</CommandEmpty>
                                            <CommandGroup>
                                                {listTypeGroups.filter(g => g.typeName !== group.typeName).map(destGroup => (
                                                    <CommandItem key={destGroup.typeName} onSelect={() => onMoveList(list.id, group.typeName, destGroup.typeName)}>
                                                        {destGroup.typeName}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        ))}
                    </CollapsibleContent>
                </Collapsible>
            ))}
        </div>
    </div>
);