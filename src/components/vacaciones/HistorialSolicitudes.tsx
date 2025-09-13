
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

// DEFINITIVE FIX: Ensure 'Aprobada' uses the 'success' variant for green color.
const getBadgeVariant = (estado: string): 'success' | 'destructive' | 'secondary' | 'default' => {
  const lowerCaseEstado = estado?.toLowerCase();
  switch (lowerCaseEstado) {
    case 'aprobada':
    case 'aprobado':
      return 'success'; // Renders as green
    case 'rechazada':
    case 'rechazado':
      return 'destructive';
    case 'pendiente':
      return 'secondary';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  try {
    // Handle potential timezone issues by parsing as ISO and formatting
    return format(parseISO(dateString), 'PPP', { locale: es });
  } catch (error) {
    console.warn(`Could not parse date: ${dateString}`);
    // Fallback for non-ISO formats, assuming local time
    return format(new Date(dateString), 'PPP', { locale: es });
  }
};

const HistorialSolicitudes = ({ solicitudes, loading }) => {
  if (loading) {
    return <p>Cargando historial...</p>;
  }

  if (!solicitudes || solicitudes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historial de Solicitudes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tienes solicitudes anteriores.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Solicitudes</CardTitle>
        <CardDescription>Todas tus solicitudes de vacaciones y permisos.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Días</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.map((solicitud) => (
              <TableRow key={solicitud.id}>
                <TableCell className="font-medium">{solicitud.motivo || 'Vacaciones'}</TableCell>
                <TableCell>
                  {solicitud.fecha_inicio && solicitud.fecha_fin ? 
                  `${formatDate(solicitud.fecha_inicio)} - ${formatDate(solicitud.fecha_fin)}`:
                  'Fecha no especificada'}
                </TableCell>
                <TableCell>{solicitud.total_dias || 'N/A'}</TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(solicitud.estado)}>{solicitud.estado}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HistorialSolicitudes;
