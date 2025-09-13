import { useState } from 'react';
import { SaldoVacaciones } from "./SaldoVacaciones";
import HistorialSolicitudes from "./HistorialSolicitudes"; // CORRECCIÓN: Importación por defecto
import { FormularioSolicitud } from './FormularioSolicitud';

/**
 * MisVacaciones
 * 
 * Este componente ahora integra completamente la vista "Mis Vacaciones":
 * 1. El saldo de días de vacaciones.
 * 2. El formulario para crear nuevas solicitudes.
 * 3. El historial de solicitudes, que se refresca automáticamente.
 */
export const MisVacaciones = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSolicitudCreada = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-6">
      <SaldoVacaciones key={`saldo-${refreshKey}`} />
      <FormularioSolicitud onSolicitudCreada={handleSolicitudCreada} />
      {/* Historial de solicitudes se refrescará gracias a la key */}
      <HistorialSolicitudes key={`historial-${refreshKey}`} />
    </div>
  );
};