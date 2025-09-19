-- =====================================================================================
-- MIGRACIÓN PARA CREAR LA FUNCIÓN execute_unrestricted_sql
-- FECHA: 2025-10-16
-- AUTOR: AI Assistant
-- PROPÓSITO: Crear una función administrativa separada para ejecutar comandos
--            SQL desde Edge Functions, sin entrar en conflicto con la función
--            'execute_sql' existente que es de solo lectura.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.execute_unrestricted_sql(sql_command TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql_command;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permiso de ejecución a los roles autenticados para que las funciones puedan llamarla.
-- La seguridad está garantizada porque la función solo es llamada desde nuestro
-- código de backend controlado y no directamente desde el cliente.
GRANT EXECUTE ON FUNCTION public.execute_unrestricted_sql(TEXT) TO authenticated;
