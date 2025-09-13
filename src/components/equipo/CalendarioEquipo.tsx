
import { useState, useMemo, memo } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { eachDayOfInterval, isSameDay, format } from 'date-fns';
import { es } from 'date-fns/locale';

const parseDate = (dateString: string) => new Date(dateString + 'T00:00:00');

// DEFINITIVE FIX: Ensure 'Aprobada' uses the 'success' variant for green color.
const getBadgeVariant = (estado: string): 'success' | 'destructive' | 'secondary' | 'default' => {
  const lowerCaseEstado = estado?.toLowerCase();
  switch (lowerCaseEstado) {
    case 'aprobada':
    case 'aprobado':
      return 'success'; // Should render as green
    case 'rechazada':
    case 'rechazado':
      return 'destructive';
    case 'pendiente':
      return 'secondary';
    default:
      return 'default';
  }
};

const DayComponent = memo(({ date, events, selectedDay, onDayClick }) => {
  const dayEvents = events.get(date.toDateString()) || [];
  const approvedEvents = dayEvents.filter(e => e.estado?.toLowerCase() === 'aprobado' || e.estado?.toLowerCase() === 'aprobada');

  const handleDayClick = () => {
    onDayClick(approvedEvents.length > 0 ? date : null);
  };

  // FEATURE: Only show dots for approved vacations or permissions.
  const isApprovedVacation = approvedEvents.some(e => e.tipo === 'Vacaciones');
  const isApprovedPermission = approvedEvents.some(e => e.tipo === 'Permiso');

  const dayContent = (
    <div className="relative h-9 w-full flex flex-col items-center justify-center" onClick={handleDayClick}>
      <span>{date.getDate()}</span>
      {(isApprovedVacation || isApprovedPermission) && (
        <div className="flex space-x-1 mt-0.5">
          {isApprovedVacation && <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>}
          {isApprovedPermission && <div className="h-1.5 w-1.5 rounded-full bg-yellow-400"></div>}
        </div>
      )}
    </div>
  );

  if (approvedEvents.length === 0) {
    return dayContent;
  }

  return (
    <Popover
      open={selectedDay ? isSameDay(date, selectedDay) : false}
      onOpenChange={(isOpen) => !isOpen && onDayClick(null)}
    >
      <PopoverTrigger asChild className="cursor-pointer">
        {dayContent}
      </PopoverTrigger>
      <PopoverContent className="w-72 z-50" align="start">
        <div className="font-bold mb-2">Ausencias Aprobadas para el {format(date, "d 'de' LLLL", { locale: es })}</div>
        <ul className="space-y-2">
          {/* FEATURE: Show only approved events in popover */}
          {approvedEvents.map((event) => (
            <li key={event.id} className="flex items-center justify-between text-sm">
              <span>{event.nombre}: <span className='font-semibold'>{event.motivo}</span></span>
              <Badge variant={getBadgeVariant(event.estado)}>{event.estado}</Badge>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
});

export const CalendarioEquipo = ({ solicitudes, miembros }) => {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const eventsByDate = useMemo(() => {
    const events = new Map();
    (solicitudes || []).forEach(solicitud => {
      if (!solicitud.fecha_inicio || !solicitud.fecha_fin) return;
      try {
        const interval = { start: parseDate(solicitud.fecha_inicio), end: parseDate(solicitud.fecha_fin) };
        if (interval.start > interval.end) return;

        const dates = eachDayOfInterval(interval);
        dates.forEach((date) => {
          const anfitrion = (miembros || []).find(m => m.user_id === solicitud.solicitante_user_id);
          const eventInfo = {
            id: `${solicitud.id}-${date.toISOString()}`,
            nombre: anfitrion?.Nombre || 'Desconocido',
            tipo: solicitud.motivo ? 'Permiso' : 'Vacaciones',
            motivo: solicitud.motivo || 'Vacaciones',
            estado: solicitud.estado,
          };
          const dateString = date.toDateString();
          if (!events.has(dateString)) events.set(dateString, []);
          events.get(dateString).push(eventInfo);
        });
      } catch (e) {
        console.error("Error processing date interval for solicitud:", solicitud, e);
      }
    });
    return events;
  }, [solicitudes, miembros]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Ausencias</CardTitle>
        <CardDescription>Haz clic en un día para ver las ausencias aprobadas.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <Calendar
          components={{
            Day: (props) => (
              <DayComponent 
                date={props.date} 
                events={eventsByDate} 
                selectedDay={selectedDay} 
                onDayClick={setSelectedDay} 
              />
            )
          }}
          className="p-0"
        />
        {/* FEATURE: Simplified legend */}
        <div className="mt-4 flex items-center space-x-4 text-sm self-start">
          <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>Vacaciones (Aprob.)</div>
          <div className="flex items-center"><div className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></div>Permiso (Aprob.)</div>
        </div>
      </CardContent>
    </Card>
  );
};
