-- =====================================================================================
-- MIGRACIÓN PARA CREAR LA FUNCIÓN AUXILIAR execute_sql
-- FECHA: 2025-10-16
-- AUTOR: AI Assistant
-- PROPÓSITO: Solucionar el error "Could not find the function public.execute_sql"
--            que se produce en la Edge Function 'setup-sync-tables'. Esta función
--            es un componente esencial para permitir que las funciones ejecuten
--            SQL dinámico (como CREATE TABLE) con privilegios elevados.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.execute_sql(sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgar permiso de ejecución a los roles autenticados para que las funciones puedan llamarla.
GRANT EXECUTE ON FUNCTION public.execute_sql(TEXT) TO authenticated;
