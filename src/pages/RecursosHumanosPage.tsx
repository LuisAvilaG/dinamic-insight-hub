
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { MisVacaciones } from "@/components/vacaciones/MisVacaciones";
import { GestionEquipo } from "@/components/vacaciones/GestionEquipo";
import { MisPermisos } from "@/components/permisos/MisPermisos"; // 1. Importar el nuevo componente

export const RecursosHumanosPage = () => {
  const { profile } = useAuth();

  const esLider = profile?.role?.toLowerCase() === 'líder' || profile?.role?.toLowerCase() === 'admin';

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* 2. Cambiar el valor por defecto a la nueva pestaña */}
      <Tabs defaultValue="mis-permisos" className="w-full">
        {/* 3. Ajustar el grid para 2 o 3 columnas */}
        <TabsList className={`grid w-full max-w-lg ${esLider ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <TabsTrigger value="mis-permisos" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Mis Permisos
          </TabsTrigger>
          <TabsTrigger value="mis-vacaciones" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Mis Vacaciones
          </TabsTrigger>
          {esLider && (
            <TabsTrigger value="mi-equipo" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              Mi Equipo
            </TabsTrigger>
          )}
        </TabsList>

        {/* 4. Añadir el contenido para la pestaña "Mis Permisos" */}
        <TabsContent value="mis-permisos" className="mt-4">
          <MisPermisos />
        </TabsContent>

        <TabsContent value="mis-vacaciones" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mi Historial de Vacaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <MisVacaciones />
            </CardContent>
          </Card>
        </TabsContent>

        {esLider && (
          <TabsContent value="mi-equipo" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Solicitudes del Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                <GestionEquipo />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
