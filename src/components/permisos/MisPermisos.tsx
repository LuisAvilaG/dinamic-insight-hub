
import { useState } from 'react';
import { SaldoPermisos } from "./SaldoPermisos";
import { HistorialSolicitudesPermisos } from "./HistorialSolicitudesPermisos";
import { FormularioSolicitudPermiso } from './FormularioSolicitudPermiso';

/**
 * MisPermisos
 * 
 * Este componente integra la vista completa de "Mis Permisos":
 * 1. El saldo de días especiales disponibles.
 * 2. El formulario para crear nuevas solicitudes de permiso.
 * 3. El historial de solicitudes, que se refresca automáticamente.
 */
export const MisPermisos = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSolicitudCreada = () => {
    // Incrementa la key para forzar el re-renderizado de los componentes que la usan
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <div className="space-y-6">
      {/* Saldo de permisos se refrescará gracias a la key */}
      <SaldoPermisos key={`saldo-${refreshKey}`} />

      {/* Formulario para crear una nueva solicitud de permiso */}
      <FormularioSolicitudPermiso onSolicitudCreada={handleSolicitudCreada} />

      {/* Historial de solicitudes de permisos se refrescará gracias a la key */}
      <HistorialSolicitudesPermisos key={`historial-${refreshKey}`} onSolicitudUpdated={handleSolicitudCreada} />
    </div>
  );
};
