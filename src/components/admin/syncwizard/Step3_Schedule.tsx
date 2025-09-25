// /components/wizards/add-sync/Step3_Schedule.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { ScheduleSelector, Schedule } from '../../admin/ScheduleSelector'; // Ruta corregida

// Definimos las props que necesita este componente final.
interface Step3Props {
    syncMode: 'incremental' | 'full';
    onSyncModeChange: (mode: 'incremental' | 'full') => void;
    onScheduleChange: (schedule: Schedule | null, cron: string) => void;
    onBack: () => void;
    onSave: () => void;
    isLoading: boolean;
}

export const Step3_Schedule: React.FC<Step3Props> = ({
    syncMode,
    onSyncModeChange,
    onScheduleChange,
    onBack,
    onSave,
    isLoading
}) => {
    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle>Paso 3: Destino y Programación</CardTitle>
                        <CardDescription>Configura la frecuencia y el modo de la sincronización.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <ScheduleSelector onChange={onScheduleChange} />
                <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold text-md mb-4">Modo de Sincronización</h3>
                    <RadioGroup value={syncMode} onValueChange={onSyncModeChange}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="incremental" id="incremental" />
                            <Label htmlFor="incremental">Incremental</Label>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">Solo sincroniza tareas nuevas o modificadas desde la última ejecución.</p>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full" id="full" />
                            <Label htmlFor="full">Reemplazo Completo</Label>
                        </div>
                        <p className="text-xs text-muted-foreground pl-6">Borra todos los datos existentes en la tabla y los carga de nuevo.</p>
                    </RadioGroup>
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Anterior</Button>
                <Button onClick={onSave} disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Guardar y Activar Sincronización</Button>
            </CardFooter>
        </Card>
    );
};