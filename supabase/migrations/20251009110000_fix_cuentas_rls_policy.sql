
-- =====================================================================================
-- MIGRACIÓN PARA CORREGIR POLÍTICAS DE SEGURIDAD EN LA TABLA 'CUENTAS'
-- FECHA: 2025-10-09
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Solucionar el error 400 al seleccionar la columna 'RolEmpresa'.
--            La causa raíz es que las políticas de RLS existentes no conceden
--            permiso de SELECT sobre la nueva columna. Esta migración recrea
--            las políticas para asegurar que los roles 'admin' y 'rh' puedan
--            leer todos los datos de los empleados.
-- =====================================================================================

-- 1. Habilitar RLS en la tabla (si no está ya habilitado, no causa error)
ALTER TABLE public."Cuentas" ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas antiguas para evitar conflictos.
--    Se usan 'IF EXISTS' para que no falle si las políticas no existen.
DROP POLICY IF EXISTS "Allow admin and rh to view all accounts" ON public."Cuentas";
DROP POLICY IF EXISTS "Allow users to view their own account" ON public."Cuentas";

-- 3. Crear política para Administradores y RRHH
--    Esta política les permite seleccionar (leer) todas las filas y columnas.
CREATE POLICY "Allow admin and rh to view all accounts"
ON public."Cuentas"
FOR SELECT
USING (
  (get_my_claim('role'::text) = '"admin"'::jsonb) OR (get_my_claim('role'::text) = '"rh"'::jsonb)
);

-- 4. Crear política para que los usuarios vean sus propios datos
--    Esta política permite a cualquier usuario autenticado leer su propia fila.
CREATE POLICY "Allow users to view their own account"
ON public."Cuentas"
FOR SELECT
USING (
  auth.uid() = user_id
);

-- =====================================================================================
-- FIN DE LA MIGRACIÓN
-- =====================================================================================
