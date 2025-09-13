
-- ========= PASO 1: Eliminar la lógica de funciones y las políticas existentes =========
--
-- ANÁLISIS: El uso de una función SECURITY DEFINER, aunque teóricamente robusto, ha fallado en la práctica.
-- Vamos a eliminar esta capa de complejidad para volver a un enfoque más directo y depurable.

DROP POLICY IF EXISTS "Aprobadores pueden ver las solicitudes de su equipo" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Aprobadores pueden actualizar (aprobar/rechazar) solicitudes de su equipo" ON public.vacaciones_solicitudes;
DROP FUNCTION IF EXISTS public.is_approver_for(uuid, uuid);


-- ========= PASO 2: Re-crear las políticas con una sub-consulta directa =========
--
-- Ahora que la tabla `vacaciones_aprobadores` tiene la política de SELECT correcta para los líderes (gracias a la última migración),
-- una sub-consulta directa debería funcionar. Esta es la forma más simple y canónica de expresar la regla.
--
-- La lógica es: permitir la acción si se puede encontrar una entrada en `vacaciones_aprobadores` que conecte
-- al usuario actual (`auth.uid()`) como el aprobador del solicitante de la vacación.

CREATE POLICY "Aprobadores pueden ver las solicitudes de su equipo" 
ON public.vacaciones_solicitudes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.vacaciones_aprobadores
    WHERE aprobador_user_id = auth.uid()
      AND empleado_user_id = solicitante_user_id
  )
);

CREATE POLICY "Aprobadores pueden actualizar solicitudes de su equipo"
ON public.vacaciones_solicitudes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.vacaciones_aprobadores
    WHERE aprobador_user_id = auth.uid()
      AND empleado_user_id = solicitante_user_id
  )
)
WITH CHECK (estado IN ('Aprobada', 'Rechazada'));
