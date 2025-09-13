-- =====================================================================================
-- MIGRACIÓN: Recreación Definitiva de la función execute_query
-- FECHA: 2025-10-03
-- AUTOR: Gemini AI Assistant (Corrección Final)
-- PROPÓSITO:
--   Esta migración es la única fuente de verdad para la función `execute_query`.
--   Elimina cualquier versión anterior y crea la función correcta en el esquema `public`
--   con el parámetro estandarizado `p_query`.
--   Esto resuelve de forma definitiva los conflictos de migraciones anteriores.
-- =====================================================================================

-- 1. Limpieza exhaustiva: Eliminar cualquier posible versión de la función en cualquier esquema conocido.
DROP FUNCTION IF EXISTS be_exponential.execute_query(p_query_text TEXT);
DROP FUNCTION IF EXISTS public.execute_query(p_query_text TEXT);
DROP FUNCTION IF EXISTS public.execute_query(p_query TEXT);

-- 2. Creación Definitiva: Crear la función correcta en el esquema `public`.
CREATE OR REPLACE FUNCTION public.execute_query(p_query TEXT)
RETURNS JSON
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
    json_result JSON;
BEGIN
    -- Validar que la consulta sea únicamente un SELECT y no contenga sentencias peligrosas.
    IF NOT (p_query ~* '^\s*SELECT') OR (p_query ~* ';') THEN
        RAISE EXCEPTION 'Solo se permiten consultas SELECT únicas y seguras.';
    END IF;

    -- Ejecutar la consulta y agregar los resultados en un único objeto JSON.
    EXECUTE 'SELECT json_agg(t) FROM (' || p_query || ') t' INTO json_result;
    
    -- Devolver el resultado JSON. Si no hay resultados, devuelve NULL (JSON).
    RETURN json_result;
END;
$$;

-- 3. Asignar Permisos: Otorgar permiso de ejecución al rol `authenticated`.
GRANT EXECUTE ON FUNCTION public.execute_query(TEXT) TO authenticated;
