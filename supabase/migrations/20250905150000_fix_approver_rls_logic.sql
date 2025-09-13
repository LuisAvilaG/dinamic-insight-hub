
-- ========= PASO 1: Crear una función de ayuda SEGURA para verificar la jerarquía =========
--
-- Esta función comprueba si un `approver_id_to_check` es el aprobador directo de un `employee_id_to_check`.
-- Se utiliza `SECURITY DEFINER` para que la función pueda leer la tabla `vacaciones_aprobadores` completa,
-- eludiendo cualquier política de RLS que pudiera interferir con la comprobación. Esta es una práctica
-- estándar y segura para este tipo de lógica de permisos.

CREATE OR REPLACE FUNCTION public.is_approver_for(approver_id_to_check UUID, employee_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.vacaciones_aprobadores
    WHERE aprobador_user_id = approver_id_to_check
      AND empleado_user_id = employee_id_to_check
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ========= PASO 2: Eliminar las políticas de seguridad antiguas y defectuosas =========
--
-- Se eliminan las políticas para ver y actualizar solicitudes, ya que su lógica de sub-búsqueda era errónea.

DROP POLICY IF EXISTS "Aprobadores pueden ver las solicitudes de su equipo" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Aprobadores pueden actualizar (aprobar/rechazar) solicitudes de su equipo" ON public.vacaciones_solicitudes;


-- ========= PASO 3: Crear las nuevas políticas de seguridad usando la función de ayuda =========
--
-- Estas nuevas políticas son más limpias, seguras y eficientes. Utilizan la función `is_approver_for`
-- para determinar los permisos, solucionando el problema de raíz.

CREATE POLICY "Aprobadores pueden ver las solicitudes de su equipo"
ON public.vacaciones_solicitudes
FOR SELECT
USING (public.is_approver_for(auth.uid(), solicitante_user_id));

CREATE POLICY "Aprobadores pueden actualizar (aprobar/rechazar) solicitudes de su equipo"
ON public.vacaciones_solicitudes
FOR UPDATE
USING (public.is_approver_for(auth.uid(), solicitante_user_id))
WITH CHECK (estado IN ('Aprobada', 'Rechazada'));

