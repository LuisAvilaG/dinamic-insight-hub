-- migrations/20251002160000_fix_get_dashboard_details_column_names.sql

-- =====================================================================================
-- MIGRACIÓN DE CORRECCIÓN FINAL PARA LA FUNCIÓN get_dashboard_details
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO:
--   Corregir MÚLTIPLES errores de nombres de columna en la función `get_dashboard_details`.
--   Las migraciones anteriores fallaron porque solo corrigieron un error a la vez, mientras
--   existían otros.
--
--   ANÁLISIS DE ERRORES:
--     1. Se intentaba leer `w.position` cuando el nombre real era `w.layout`.
--     2. Se intentaba leer `w.title` cuando el nombre real era `w.name`.
--
--   Esta migración reemplaza la función por completo con una versión que utiliza los
--   nombres de columna correctos y los renombra para que coincidan con el frontend.
--   Esta debe ser la solución definitiva al problema de carga de datos.
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
                        'title', w.name,       -- ¡CORREGIDO! La columna es `name`, no `title`.
                        'type', w.type,
                        'query', w.query,
                        'options', w.options,
                        'created_at', w.created_at,
                        'position', w.layout    -- ¡CORREGIDO! La columna es `layout`, no `position`.
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
