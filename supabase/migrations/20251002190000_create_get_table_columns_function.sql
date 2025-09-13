-- =====================================================================================
-- MIGRACIÓN: Crear función para obtener columnas y tipos de una tabla
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO:
--   Crear una función RPC `get_table_columns` que devuelva los nombres y tipos de 
--   las columnas para una tabla específica en el esquema `be_exponential`.
--   Esto es esencial para el "Constructor de Consultas Visual", ya que permitirá 
--   poblar dinámicamente los selectores de métricas y dimensiones basándose
--   en la fuente de datos que el usuario haya elegido.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.get_table_columns(p_table_name TEXT)
RETURNS TABLE(column_name TEXT, data_type TEXT)
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.column_name::TEXT,
        c.data_type::TEXT
    FROM 
        information_schema.columns c
    WHERE 
        c.table_schema = 'be_exponential' 
        AND c.table_name = p_table_name;
END;
$$;

-- Otorgar permisos a los usuarios autenticados
GRANT EXECUTE ON FUNCTION public.get_table_columns(TEXT) TO authenticated;
