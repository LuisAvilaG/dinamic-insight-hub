-- =====================================================================================
-- MIGRACIÓN: Corregir y mejorar la función get_columns_from_tables
-- FECHA: 2025-10-12
-- AUTOR: AI Assistant
-- PROPÓSITO: Añadir el 'data_type' a la salida de la función. Esto es crucial para
--            que el frontend pueda filtrar columnas numéricas para las agregaciones
--            (SUM, AVG) cuando se seleccionan múltiples tablas.
-- =====================================================================================

-- Eliminar la función existente antes de volver a crearla con una nueva firma de retorno
DROP FUNCTION IF EXISTS public.get_columns_from_tables(TEXT[]);

-- Crear la nueva versión de la función
CREATE OR REPLACE FUNCTION public.get_columns_from_tables(p_tables TEXT[])
RETURNS TABLE(display_name TEXT, schema_name TEXT, table_name TEXT, column_name TEXT, data_type TEXT)
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
    table_identifier TEXT;
    schema_part TEXT;
    table_part TEXT;
BEGIN
    -- Iterar sobre cada identificador de tabla en el array de entrada (ej: 'be_exponential.tasks')
    FOREACH table_identifier IN ARRAY p_tables
    LOOP
        -- Separar el esquema y el nombre de la tabla
        schema_part := SPLIT_PART(table_identifier, '.', 1);
        table_part := SPLIT_PART(table_identifier, '.', 2);

        -- Unir con information_schema.columns para obtener las columnas de la tabla actual
        RETURN QUERY
        SELECT
            -- Crear el nombre de visualización único, ej: 'tasks.status'
            table_part || '.' || c.column_name AS display_name,
            c.table_schema::TEXT AS schema_name,
            c.table_name::TEXT AS table_name,
            c.column_name::TEXT AS column_name,
            c.data_type::TEXT AS data_type
        FROM
            information_schema.columns c
        WHERE
            c.table_schema = schema_part
            AND c.table_name = table_part;
    END LOOP;
END;
$$;
