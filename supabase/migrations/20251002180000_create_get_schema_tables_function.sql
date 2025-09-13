-- =====================================================================================
-- MIGRACIÓN: Crear función para obtener tablas de un esquema
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO:
--   Crear una función RPC `get_schema_tables` que permita al frontend obtener de
--   forma segura una lista de todas las tablas dentro de un esquema específico.
--   Esto es un pilar fundamental para el nuevo "Constructor de Consultas Visual",
--   ya que permitirá al usuario seleccionar una fuente de datos sin conocer
--   el esquema de la base de datos de antemano.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.get_schema_tables(p_schema_name TEXT)
RETURNS TABLE(table_name TEXT)
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT c.table_name::TEXT
    FROM information_schema.tables c
    WHERE c.table_schema = p_schema_name
      -- Excluir tablas que no son relevantes para el usuario final o son internas
      AND c.table_name NOT IN ('import_logs');
END;
$$;

-- Otorgar permisos a los usuarios autenticados para que puedan llamar a esta función
GRANT EXECUTE ON FUNCTION public.get_schema_tables(TEXT) TO authenticated;
