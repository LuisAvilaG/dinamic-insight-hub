
import { PageHeader } from "@/components/layout/DashboardHeader";
import { AsignarLider } from "@/components/admin/AsignarLider";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export const GestionRecursosHumanosPage = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader 
        title="Gestión Recursos Humanos"
        description="Asigna el líder o aprobador para cada miembro del equipo."
        icon={<Users className="h-6 w-6" />}
      />
      
      {/* El contenido principal ahora está dentro de una Card para mayor consistencia */}
      <Card>
        <CardContent className="pt-6"> {/* Añadimos un poco de padding top para separar del borde */}
          <AsignarLider />
        </CardContent>
      </Card>
    </div>
  );
};
