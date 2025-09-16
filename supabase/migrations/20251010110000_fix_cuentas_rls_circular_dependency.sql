-- supabase/migrations/20251010110000_fix_cuentas_rls_circular_dependency.sql

-- =====================================================================================
--  OBJETIVO: Corregir la dependencia circular en las políticas RLS de la tabla "Cuentas"
-- =====================================================================================
--
--  PROBLEMA:
--  Las políticas de seguridad para administradores y RRHH en la tabla "Cuentas" utilizaban
--  la función `get_user_role(auth.uid())`. Esta función, a su vez, realizaba una consulta
--  sobre la misma tabla "Cuentas", creando un bucle infinito que causaba que las
--  consultas se colgaran sin devolver un resultado ni un error.
--
--  SOLUCIÓN:
--  Se modifican las políticas para que utilicen la función `get_my_role()`, que obtiene
--  el rol del usuario directamente del token de autenticación (JWT) sin necesidad de
--  consultar la base de datos. Esto rompe la dependencia circular y permite que
--  las consultas se resuelvan de manera eficiente.
--
-- =====================================================================================

-- 1. Eliminar las políticas antiguas que causan el bucle
DROP POLICY IF EXISTS "Admins tienen acceso total" ON public."Cuentas";
DROP POLICY IF EXISTS "RH puede leer todas las cuentas" ON public."Cuentas";

-- 2. Recrear la política para Admins usando get_my_role()
CREATE POLICY "Admins tienen acceso total"
ON public."Cuentas"
FOR ALL
USING (get_my_role() = 'admin');

-- 3. Recrear la política para RRHH usando get_my_role()
CREATE POLICY "RH puede leer todas las cuentas"
ON public."Cuentas"
FOR SELECT
USING (get_my_role() = 'rh');

-- NOTA: Las políticas para que los usuarios lean su propia información siguen igual
-- y funcionan correctamente, por lo que no se modifican.
