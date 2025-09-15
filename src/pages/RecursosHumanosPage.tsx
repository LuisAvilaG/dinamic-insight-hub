
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { MisVacaciones } from "@/components/vacaciones/MisVacaciones";
import { GestionEquipo } from "@/components/vacaciones/GestionEquipo";
import { MisPermisos } from "@/components/permisos/MisPermisos";

// Helper para renderizar el contenido basado en la pestaña activa
const TabContent = ({ tab, esLider }) => {
  switch (tab) {
    case 'mis-vacaciones':
      return (
        <Card>
          <CardHeader>
            <CardTitle>Mis Vacaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <MisVacaciones />
          </CardContent>
        </Card>
      );
    case 'mi-equipo':
      if (esLider) {
        return <GestionEquipo />;
      }
      return null;
    case 'mis-permisos':
    default:
      return (
        <Card>
          <CardHeader>
            <CardTitle>Mis Permisos</CardTitle>
          </CardHeader>
          <CardContent>
            <MisPermisos />
          </CardContent>
        </Card>
      );
  }
};

export const RecursosHumanosPage = () => {
  const { profile } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'mis-permisos';

  const esLider = profile?.role?.toLowerCase() === 'líder' || profile?.role?.toLowerCase() === 'admin';

  return (
    <div className="space-y-6 p-4 md:p-6">
      <TabContent tab={activeTab} esLider={esLider} />
    </div>
  );
};
