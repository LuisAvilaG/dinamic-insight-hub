
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Users } from 'lucide-react';

interface ResumenMiembro {
  id: string;
  nombre: string;
  vacaciones_disponibles: number;
  vacaciones_asignadas: number;
  permisos_disponibles: number;
  permisos_asignados: number;
}

export const ResumenEquipo = ({ resumen, loading }: { resumen: ResumenMiembro[], loading: boolean }) => {

  if (loading) {
    return (
        <div className="flex items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!resumen || resumen.length === 0) {
    return (
      <div className="text-center py-10">
        <Users className="h-12 w-12 mx-auto text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">Aún no tienes miembros en tu equipo.</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de Saldos del Equipo</CardTitle>
        <CardDescription>Visualiza los días disponibles y asignados de cada miembro.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empleado</TableHead>
              <TableHead className="text-center">Vacaciones (Disp/Asig)</TableHead>
              <TableHead className="text-center">Permisos (Disp/Asig)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resumen.map((miembro) => (
              <TableRow key={miembro.id}>
                <TableCell className="font-medium">{miembro.nombre}</TableCell>
                <TableCell className="text-center">
                  {`${miembro.vacaciones_disponibles} / ${miembro.vacaciones_asignadas}`}
                </TableCell>
                <TableCell className="text-center">
                    {`${miembro.permisos_disponibles} / ${miembro.permisos_asignados}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
