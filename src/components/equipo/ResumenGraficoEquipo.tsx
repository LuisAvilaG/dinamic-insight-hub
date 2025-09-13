
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

const StatBar = ({ label, total, disponible, colorClass }) => {
  const usados = total - disponible;
  const porcentajeUsados = total > 0 ? (usados / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{`${disponible} de ${total} días disp.`}</span>
      </div>
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger className="w-full cursor-default">
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${porcentajeUsados}%` }}></div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{`${usados} días usados`}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export const ResumenGraficoEquipo = ({ resumen, loading }) => {
  if (loading) {
    return <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!resumen || resumen.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Saldos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No hay datos de resumen para mostrar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resumen.map(miembro => (
        <Card key={miembro.id}>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{miembro.nombre}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <StatBar
              label="Vacaciones"
              total={miembro.vacaciones_asignadas}
              disponible={miembro.vacaciones_disponibles}
              colorClass="bg-blue-500"
            />
            <StatBar
              label="Permisos"
              total={miembro.permisos_asignados}
              disponible={miembro.permisos_disponibles}
              colorClass="bg-amber-500"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
