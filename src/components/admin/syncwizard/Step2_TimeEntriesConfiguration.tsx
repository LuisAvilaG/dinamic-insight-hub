import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Step2TimeEntriesProps {
  onNext: () => void;
  onBack: () => void;
  timeSyncInitialHistoryLoad: boolean;
  onTimeSyncInitialHistoryLoadChange: (checked: boolean) => void;
  timeSyncScope: 'last_week' | 'last_30_days' | 'custom_range' | null;
  onTimeSyncScopeChange: (scope: 'last_week' | 'last_30_days' | 'custom_range') => void;
  timeSyncCustomStartDate: Date | null;
  onTimeSyncCustomStartDateChange: (date: Date | undefined) => void;
  timeSyncCustomEndDate: Date | null;
  onTimeSyncCustomEndDateChange: (date: Date | undefined) => void;
}

export const Step2_TimeEntriesConfiguration: React.FC<Step2TimeEntriesProps> = ({
  onNext,
  onBack,
  timeSyncInitialHistoryLoad,
  onTimeSyncInitialHistoryLoadChange,
  timeSyncScope,
  onTimeSyncScopeChange,
  timeSyncCustomStartDate,
  onTimeSyncCustomStartDateChange,
  timeSyncCustomEndDate,
  onTimeSyncCustomEndDateChange,
}) => {
  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle>Paso 2: Configuración de Registros de Tiempo</CardTitle>
        <CardDescription>
          Define cómo deseas sincronizar los registros de tiempo de ClickUp.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="time-history-load"
              checked={timeSyncInitialHistoryLoad}
              onCheckedChange={onTimeSyncInitialHistoryLoadChange}
            />
            <Label htmlFor="time-history-load" className="font-medium">
              Cargar todo el historial de registros de tiempo disponible (una sola vez)
            </Label>
          </div>
          <p className="text-sm text-muted-foreground ml-6">
            Si se marca, la primera sincronización traerá todos los registros históricos. Las siguientes se basarán en el rango continuo.
          </p>
        </div>

        <div className="p-4 border rounded-lg space-y-3">
          <h3 className="font-semibold text-md mb-2">Rango de Sincronización Continua</h3>
          <RadioGroup
            value={timeSyncScope ?? ''}
            onValueChange={onTimeSyncScopeChange as (value: string) => void}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="last_week" id="last_week" />
              <Label htmlFor="last_week">Última Semana (dinámico)</Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Sincroniza registros de tiempo de los últimos 7 días hasta hoy en cada ejecución.
            </p>

            <div className="flex items-center space-x-2 mt-4">
              <RadioGroupItem value="last_30_days" id="last_30_days" />
              <Label htmlFor="last_30_days">Últimos 30 Días (dinámico)</Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              Sincroniza registros de tiempo de los últimos 30 días hasta hoy en cada ejecución.
            </p>

            <div className="flex items-center space-x-2 mt-4">
              <RadioGroupItem value="custom_range" id="custom_range" />
              <Label htmlFor="custom_range">Rango de Fechas Personalizado</Label>
            </div>
            <p className="text-xs text-muted-foreground pl-6 mb-2">
              Define un rango de fechas fijo para la sincronización continua.
            </p>
            {timeSyncScope === 'custom_range' && (
              <div className="flex space-x-4 pl-6">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !timeSyncCustomStartDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {timeSyncCustomStartDate ? format(timeSyncCustomStartDate, "PPP") : <span>Fecha de inicio</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={timeSyncCustomStartDate ?? undefined}
                      onSelect={onTimeSyncCustomStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !timeSyncCustomEndDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {timeSyncCustomEndDate ? format(timeSyncCustomEndDate, "PPP") : <span>Fecha de fin</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={timeSyncCustomEndDate ?? undefined}
                      onSelect={onTimeSyncCustomEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Anterior</Button>
        <Button onClick={onNext} disabled={!timeSyncScope || (timeSyncScope === 'custom_range' && (!timeSyncCustomStartDate || !timeSyncCustomEndDate))}>
          Siguiente <ArrowRight className="h-4 w-4 ml-2"/>
        </Button>
      </CardFooter>
    </Card>
  );
};
