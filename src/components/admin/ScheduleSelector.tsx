import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ScheduleType = 'interval' | 'daily' | 'weekly' | 'monthly';

export interface Schedule {
  type: ScheduleType;
  interval?: 15 | 30 | 60;
  time?: string; // HH:mm
  dayOfWeek?: number; // 0-6 (Sun-Sat)
  dayOfMonth?: number; // 1-31
}

interface ScheduleSelectorProps {
  onChange: (schedule: Schedule, cron: string) => void;
}

const WEEK_DAYS = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

const generateCron = (schedule: Schedule): string => {
    const { type, interval, time, dayOfWeek, dayOfMonth } = schedule;
    const [hour, minute] = time ? time.split(':') : ['0', '0'];

    switch (type) {
        case 'interval':
            // At every X minute
            return `*/${interval} * * * *`;
        case 'daily':
            // At time HH:MM every day
            return `${minute} ${hour} * * *`;
        case 'weekly':
            // At time HH:MM on dayOfWeek
            return `${minute} ${hour} * * ${dayOfWeek}`;
        case 'monthly':
            // At time HH:MM on dayOfMonth
            return `${minute} ${hour} ${dayOfMonth} * *`;
        default:
            return '';
    }
};

export const ScheduleSelector = ({ onChange }: ScheduleSelectorProps) => {
  const [schedule, setSchedule] = useState<Schedule>({
    type: 'interval',
    interval: 15,
    time: '09:00',
    dayOfWeek: 1,
    dayOfMonth: 1,
  });

  useEffect(() => {
    const cron = generateCron(schedule);
    onChange(schedule, cron);
  }, [schedule, onChange]);

  const handleTypeChange = (type: ScheduleType) => {
    // Create a fresh state based on the new type to ensure clean defaults
    let newSchedule: Schedule = { type };
    switch (type) {
        case 'interval':
            newSchedule = { ...newSchedule, interval: 15 };
            break;
        case 'daily':
            newSchedule = { ...newSchedule, time: '09:00' };
            break;
        case 'weekly':
            newSchedule = { ...newSchedule, time: '09:00', dayOfWeek: 1 };
            break;
        case 'monthly':
            newSchedule = { ...newSchedule, time: '09:00', dayOfMonth: 1 };
            break;
        default:
            break;
    }
    setSchedule(newSchedule);
  };

  return (
    <div className="space-y-4 p-4 border rounded-md">
       <h3 className="text-lg font-medium">Frecuencia de Sincronización</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1 md:col-span-2">
          <Label htmlFor="schedule-type">Tipo de Programación</Label>
          <Select value={schedule.type} onValueChange={(value: ScheduleType) => handleTypeChange(value)}>
            <SelectTrigger id="schedule-type">
              <SelectValue placeholder="Selecciona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interval">Intervalos</SelectItem>
              <SelectItem value="daily">Diariamente</SelectItem>
              <SelectItem value="weekly">Semanalmente</SelectItem>
              <SelectItem value="monthly">Mensualmente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {schedule.type === 'interval' && (
          <div className="col-span-1 md:col-span-2">
            <Label htmlFor="interval">Ejecutar cada</Label>
            <Select
              value={String(schedule.interval)}
              onValueChange={(value) => setSchedule({ ...schedule, interval: Number(value) as 15 | 30 | 60 })}
            >
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        { (schedule.type === 'daily' || schedule.type === 'weekly' || schedule.type === 'monthly') && (
            <div>
                <Label htmlFor="time">Hora de ejecución</Label>
                <Input
                    id="time"
                    type="time"
                    value={schedule.time}
                    onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                />
            </div>
        )}

        {schedule.type === 'weekly' && (
            <div>
                <Label htmlFor="day-of-week">Día de la semana</Label>
                 <Select
                    value={String(schedule.dayOfWeek)}
                    onValueChange={(value) => setSchedule({ ...schedule, dayOfWeek: Number(value)})}
                >
                    <SelectTrigger id="day-of-week">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {WEEK_DAYS.map(day => (
                            <SelectItem key={day.value} value={String(day.value)}>{day.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        )}

        {schedule.type === 'monthly' && (
            <div>
                <Label htmlFor="day-of-month">Día del mes</Label>
                <Input
                    id="day-of-month"
                    type="number"
                    min="1"
                    max="31"
                    value={schedule.dayOfMonth}
                    onChange={(e) => {
                        const day = Math.max(1, Math.min(31, Number(e.target.value)));
                        setSchedule({ ...schedule, dayOfMonth: day });
                    }}
                />
            </div>
        )}
      </div>
    </div>
  );
};
