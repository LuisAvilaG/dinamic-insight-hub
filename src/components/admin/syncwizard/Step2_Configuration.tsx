// /components/wizards/add-sync/Step2_Configuration.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { TemplatesPanel } from './TemplatesPanel'; // ¡Importamos nuestro componente!
import { Database, Settings, ArrowRight, ArrowLeft } from 'lucide-react';

// Definimos las props que necesita este componente. Son bastantes,
// ya que maneja toda la configuración de datos.

// Estructura de un grupo/plantilla
interface ListGroup {
    typeName: string;
    count: number;
    lists: { id: string; name: string }[];
    sampleListId: string;
}

// Estructura de una lista individual
interface ClickUpList {
    id: string;
    name: string;
}

interface Step2Props {
    isTemplateMode: boolean;
    onIsTemplateModeChange: (checked: boolean) => void;
    listTypeGroups: ListGroup[];
    activeMappings: Set<string>;
    onToggleActive: (key: string, isActive: boolean) => void;
    onConfigure: (item: ListGroup | ClickUpList) => void;
    listExclusions: Set<string>;
    onToggleListExclusion: (listId: string, isExcluded: boolean) => void;
    onMoveList: (listId: string, sourceGroup: string, destGroup: string) => void;
    onSelectAllTemplates: () => void;
    onDeselectAllTemplates: () => void;
    onExpandTemplates: () => void;
    allLists: ClickUpList[];
    isTimeTrackingEnabled: boolean;
    onTimeTrackingChange: (checked: boolean) => void;
    onNext: () => void;
    onBack: () => void;
}

export const Step2_Configuration: React.FC<Step2Props> = ({
    isTemplateMode,
    onIsTemplateModeChange,
    listTypeGroups,
    activeMappings,
    onToggleActive,
    onConfigure,
    listExclusions,
    onToggleListExclusion,
    onMoveList,
    onSelectAllTemplates,
    onDeselectAllTemplates,
    onExpandTemplates,
    allLists,
    isTimeTrackingEnabled,
    onTimeTrackingChange,
    onNext,
    onBack
}) => {
    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Database className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Paso 2: Configuración de Datos</CardTitle>
                        <CardDescription>Define cómo quieres mapear los datos de ClickUp.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-md">Modo de Configuración</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="template-mode-switch" className="flex flex-col space-y-1">
                            <span>Detección Automática de Plantillas</span>
                            <span className="font-normal text-xs text-muted-foreground">Agrupa listas por nombre para una configuración más rápida.</span>
                        </Label>
                        <Switch id="template-mode-switch" checked={isTemplateMode} onCheckedChange={onIsTemplateModeChange} />
                    </div>
                </div>
                <Separator />
                {isTemplateMode ? (
                    <TemplatesPanel 
                        listTypeGroups={listTypeGroups} 
                        activeMappings={activeMappings} 
                        onConfigure={onConfigure} 
                        listExclusions={listExclusions} 
                        onToggleListExclusion={onToggleListExclusion} 
                        onToggleActive={onToggleActive} 
                        onMoveList={onMoveList} 
                        onSelectAll={onSelectAllTemplates} 
                        onDeselectAll={onDeselectAllTemplates} 
                        onExpand={onExpandTemplates} 
                    />
                ) : (
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold text-md mb-2">Configuración Manual</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {allLists.map(list => (
                                <div key={list.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div><p className="font-medium">{list.name}</p></div>
                                    <div className="flex items-center space-x-4">
                                        <Button variant="outline" size="sm" onClick={() => onConfigure(list)} disabled={!activeMappings.has(list.id)}>
                                            <Settings className="h-4 w-4 mr-2"/>Configurar
                                        </Button>
                                        <Switch checked={activeMappings.has(list.id)} onCheckedChange={(checked) => onToggleActive(list.id, checked)}/>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <Separator />
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-md mb-2">Registros de Tiempo</h3>
                    <div className="flex items-center justify-between">
                        <Label htmlFor="time-tracking-switch" className="font-medium">Sincronizar Registros de Tiempo</Label>
                        <Switch id="time-tracking-switch" checked={isTimeTrackingEnabled} onCheckedChange={onTimeTrackingChange} />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Anterior</Button>
                <Button onClick={onNext}>Siguiente<ArrowRight className="h-4 w-4 ml-2" /></Button>
            </CardFooter>
        </Card>
    );
};