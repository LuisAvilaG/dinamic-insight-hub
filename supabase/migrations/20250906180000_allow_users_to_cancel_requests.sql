
-- =====================================================================================
-- MIGRACIÓN PARA PERMITIR LA CANCELACIÓN DE SOLICITUDES
-- FECHA: 2025-09-06
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Añadir una política de RLS para que los empleados puedan cancelar
--            sus propias solicitudes de vacaciones si están en estado 'Pendiente'.
-- =====================================================================================

-- Limpiar política anterior por si existe, para evitar conflictos
DROP POLICY IF EXISTS "Empleados pueden cancelar sus propias solicitudes pendientes" ON public.vacaciones_solicitudes;

-- Crear la nueva política
CREATE POLICY "Empleados pueden cancelar sus propias solicitudes pendientes"
ON public.vacaciones_solicitudes
FOR UPDATE
USING (auth.uid() = solicitante_user_id AND estado = 'Pendiente')
WITH CHECK (estado = 'Cancelada');

COMMENT ON POLICY "Empleados pueden cancelar sus propias solicitudes pendientes" ON public.vacaciones_solicitudes 
IS 'Permite a un usuario cambiar el estado de su propia solicitud a "Cancelada", pero solo si la solicitud está actualmente en "Pendiente".';

-- =====================================================================================
