
-- =====================================================================================
-- MIGRACIÓN ROBUSTA PARA RECREAR LAS POLÍTICAS DE RLS DE LA TABLA DE SALDOS
-- FECHA: 2025-09-06
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Borrar y volver a crear todas las políticas de RLS necesarias en la tabla
--            `vacaciones_saldos` para evitar conflictos con políticas preexistentes.
--            Esto garantiza un estado de seguridad limpio y correcto.
-- =====================================================================================

-- Habilitar RLS en la tabla (no causa error si ya está habilitado)
ALTER TABLE public.vacaciones_saldos ENABLE ROW LEVEL SECURITY;

-- --- LIMPIEZA DE POLÍTICAS ANTERIORES ---
DROP POLICY IF EXISTS "Admins pueden gestionar saldos" ON public.vacaciones_saldos;
DROP POLICY IF EXISTS "Empleados pueden ver su propio saldo" ON public.vacaciones_saldos;
DROP POLICY IF EXISTS "Lideres pueden ver saldos de su equipo" ON public.vacaciones_saldos;
DROP POLICY IF EXISTS "Lideres pueden actualizar saldos de su equipo" ON public.vacaciones_saldos;
DROP POLICY IF EXISTS "Lideres pueden crear saldos para su equipo" ON public.vacaciones_saldos;

-- --- RECREACIÓN DE POLÍTICAS --- 

-- Política para Administradores (acceso total)
CREATE POLICY "Admins pueden gestionar saldos"
ON public.vacaciones_saldos FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'Admin');

-- Política para Empleados (solo pueden leer su propio saldo)
CREATE POLICY "Empleados pueden ver su propio saldo"
ON public.vacaciones_saldos FOR SELECT
USING (user_id = auth.uid());

-- Políticas para Líderes de Equipo (la pieza clave que faltaba)

-- Permite a los líderes LEER los saldos de los miembros de su equipo.
CREATE POLICY "Lideres pueden ver saldos de su equipo"
ON public.vacaciones_saldos FOR SELECT
USING (EXISTS (SELECT 1 FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid() AND empleado_user_id = public.vacaciones_saldos.user_id));

-- Permite a los líderes ACTUALIZAR los saldos de los miembros de su equipo (al aprobar vacaciones).
CREATE POLICY "Lideres pueden actualizar saldos de su equipo"
ON public.vacaciones_saldos FOR UPDATE
USING (EXISTS (SELECT 1 FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid() AND empleado_user_id = public.vacaciones_saldos.user_id))
WITH CHECK (EXISTS (SELECT 1 FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid() AND empleado_user_id = public.vacaciones_saldos.user_id));

-- Permite a los líderes CREAR un registro de saldo para un empleado si no existe.
CREATE POLICY "Lideres pueden crear saldos para su equipo"
ON public.vacaciones_saldos FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid() AND empleado_user_id = public.vacaciones_saldos.user_id));

-- =====================================================================================
