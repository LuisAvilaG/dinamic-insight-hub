
-- =====================================================================================
-- MIGRACIÓN URGENTE: Corrección de Políticas de Seguridad en la Tabla de Saldos de Permisos
-- FECHA: 2025-09-08
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Añadir las políticas de Row-Level Security (RLS) faltantes a la tabla
--            `permisos_saldos`. La ausencia de estas políticas impedía a los líderes
--            cargar los datos de su equipo, causando un error en la interfaz.
-- =====================================================================================

-- Habilitar RLS en la tabla (no causa error si ya está habilitado)
ALTER TABLE public.permisos_saldos ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas antiguas por si acaso para una ejecución limpia
DROP POLICY IF EXISTS "Usuarios pueden ver sus propios saldos de permisos" ON public.permisos_saldos;
DROP POLICY IF EXISTS "Líderes pueden ver saldos de su equipo" ON public.permisos_saldos;
DROP POLICY IF EXISTS "Admins tienen acceso total a los saldos de permisos" ON public.permisos_saldos;

-- ========= PASO 1: Política para Usuarios =========
-- Permite a los usuarios ver únicamente su propia fila de saldos.
CREATE POLICY "Usuarios pueden ver sus propios saldos de permisos"
ON public.permisos_saldos
FOR SELECT
USING (auth.uid() = user_id);

-- ========= PASO 2: Política para Líderes =========
-- Permite a los líderes ver las filas de saldos de los usuarios que reportan a ellos.
-- Utiliza la función `is_team_leader` que ya existe.
CREATE POLICY "Líderes pueden ver saldos de su equipo"
ON public.permisos_saldos
FOR SELECT
USING (is_team_leader(user_id));

-- ========= PASO 3: Política para Administradores =========
-- Permite a los usuarios con el rol 'admin' ver, insertar, actualizar y borrar cualquier saldo.
CREATE POLICY "Admins tienen acceso total a los saldos de permisos"
ON public.permisos_saldos
FOR ALL
USING (get_user_role(auth.uid()) = 'admin')
WITH CHECK (get_user_role(auth.uid()) = 'admin');

