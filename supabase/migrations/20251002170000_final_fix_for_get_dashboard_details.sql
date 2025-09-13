-- migrations/20251002170000_final_fix_for_get_dashboard_details.sql

-- =====================================================================================
-- MIGRACIÓN DE CORRECCIÓN ABSOLUTA Y FINAL PARA get_dashboard_details
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO:
--   Corregir un error fundamental y vergonzoso en todas las versiones anteriores de
--   la función `get_dashboard_details`. Las columnas `title`, `query` y `options`
--   nunca existieron en la tabla `report_widgets`. Siempre estuvieron contenidas
--   dentro de la columna `config` de tipo JSONB.
--
--   Esta migración reemplaza la función por completo con una versión que finalmente
--   refleja la estructura real de la tabla, extrayendo los valores anidados del
--   campo `config`.
--
--   ANÁLISIS FINAL DEL ERROR:
--     - Se intentaba leer `w.title` (o `w.name`), pero el valor real es `w.config->>'title'`.
--     - Se intentaba leer `w.query`, pero el valor real es `w.config->>'query'`.
--     - Se intentaba leer `w.options`, pero el valor real es `w.config->'options'`.
--     - Se intentaba leer `w.position`, pero el valor real es `w.layout`.
--
--   Esta es la solución definitiva.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.get_dashboard_details(p_dashboard_id UUID)
RETURNS json
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
    result json;
BEGIN
    SELECT
        json_build_object(
            'id', d.id,
            'name', d.name,
            'description', d.description,
            'department', d.department,
            'created_at', d.created_at,
            'widgets', COALESCE(
                (
                    SELECT json_agg(
                      json_build_object(
                        'id', w.id,
                        'dashboard_id', w.dashboard_id,
                        -- ACCESO CORRECTO A LOS DATOS DENTRO DEL JSON 'config'
                        'title', w.config->>'title',
                        'type', w.widget_type, -- La columna se llama widget_type
                        'query', w.config->>'query',
                        'options', w.config->'options',
                        'created_at', w.created_at,
                        -- ACCESO CORRECTO A LA COLUMNA 'layout'
                        'position', w.layout
                      ) ORDER BY (w.layout->>'y')::numeric, (w.layout->>'x')::numeric
                    )
                    FROM be_exponential.report_widgets AS w
                    WHERE w.dashboard_id = d.id
                ),
                '[]'::json
            )
        )
    INTO result
    FROM be_exponential.report_dashboards AS d
    WHERE d.id = p_dashboard_id;

    RETURN result;
END;
$$;
