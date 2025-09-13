
-- =====================================================================================
-- MIGRACIÓN DE CONSOLIDACIÓN Y CORRECCIÓN DEFINITIVA (v4 - Sintaxis Finalmente Corregida)
-- FECHA: 2025-09-06
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Corregir el error de sintaxis repetido, separando UPDATE y DELETE
--            en políticas distintas. Este es el script final, verificado.
-- =====================================================================================

-- ========= PASO 1: LIMPIEZA EXHAUSTIVA =========
-- Se eliminan todas las políticas y funciones potencialmente conflictivas de migraciones anteriores.

-- Políticas en la tabla de solicitudes
DROP POLICY IF EXISTS "Aprobadores pueden ver las solicitudes de su equipo" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Aprobadores pueden actualizar solicitudes de su equipo" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Empleados pueden ver y gestionar sus propias solicitudes" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Los administradores pueden gestionar todas las solicitudes de vacaciones" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Admins pueden gestionar todas las solicitudes" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Empleados pueden crear sus propias solicitudes" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Empleados pueden leer sus propias solicitudes" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Empleados modifican sus solicitudes pendientes" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Empleados borran sus solicitudes pendientes" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Lideres pueden ver las solicitudes de su equipo" ON public.vacaciones_solicitudes;
DROP POLICY IF EXISTS "Lideres pueden actualizar las solicitudes de su equipo" ON public.vacaciones_solicitudes;

-- Políticas en la tabla de aprobadores
DROP POLICY IF EXISTS "Los administradores pueden gestionar la jerarquía de aprobadores" ON public.vacaciones_aprobadores;
DROP POLICY IF EXISTS "Líderes pueden ver sus propias asignaciones de equipo" ON public.vacaciones_aprobadores;
DROP POLICY IF EXISTS "Admins pueden gestionar la tabla de aprobadores" ON public.vacaciones_aprobadores;
DROP POLICY IF EXISTS "Lideres pueden ver a quienes aprueban" ON public.vacaciones_aprobadores;

-- Funciones auxiliares
DROP FUNCTION IF EXISTS public.is_approver_for(uuid, uuid);
DROP FUNCTION IF EXISTS public.get_user_role(uuid);

-- =====================================================================================

-- ========= PASO 2: RECONSTRUCCIÓN DE LA LÓGICA DE PERMISOS =========

-- ----- Sub-paso 2.1: Función auxiliar para obtener el rol del usuario -----
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  SELECT "Rol"
  INTO v_user_role
  FROM public."Cuentas"
  WHERE user_id = p_user_id;
  RETURN v_user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----- Sub-paso 2.2: Políticas para la tabla de jerarquías `vacaciones_aprobadores` -----

CREATE POLICY "Admins pueden gestionar la tabla de aprobadores"
ON public.vacaciones_aprobadores FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'Admin');

CREATE POLICY "Lideres pueden ver a quienes aprueban"
ON public.vacaciones_aprobadores FOR SELECT
USING (aprobador_user_id = auth.uid());

-- ----- Sub-paso 2.3: Políticas para la tabla `vacaciones_solicitudes` -----

CREATE POLICY "Admins pueden gestionar todas las solicitudes"
ON public.vacaciones_solicitudes FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'Admin');

CREATE POLICY "Empleados pueden crear sus propias solicitudes"
ON public.vacaciones_solicitudes FOR INSERT
WITH CHECK (solicitante_user_id = auth.uid());

CREATE POLICY "Empleados pueden leer sus propias solicitudes"
ON public.vacaciones_solicitudes FOR SELECT
USING (solicitante_user_id = auth.uid());

-- CORRECCIÓN FINAL Y VERIFICADA: Políticas de UPDATE y DELETE separadas.
CREATE POLICY "Empleados modifican sus solicitudes pendientes"
ON public.vacaciones_solicitudes FOR UPDATE
USING (solicitante_user_id = auth.uid() AND estado = 'Pendiente');

CREATE POLICY "Empleados borran sus solicitudes pendientes"
ON public.vacaciones_solicitudes FOR DELETE
USING (solicitante_user_id = auth.uid() AND estado = 'Pendiente');

CREATE POLICY "Lideres pueden ver las solicitudes de su equipo"
ON public.vacaciones_solicitudes FOR SELECT
USING (EXISTS (SELECT 1 FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid() AND empleado_user_id = solicitante_user_id));

CREATE POLICY "Lideres pueden actualizar las solicitudes de su equipo"
ON public.vacaciones_solicitudes FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid() AND empleado_user_id = solicitante_user_id));

-- =====================================================================================
