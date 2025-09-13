-- migrations/20251002150000_fix_get_dashboard_details_function.sql

-- =====================================================================================
-- MIGRACIÓN DE CORRECCIÓN PARA LA FUNCIÓN get_dashboard_details
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO:
--   Corregir un error crítico en la función `get_dashboard_details` que fue introducido
--   en una migración anterior. La versión anterior intentaba seleccionar una columna
--   `w.position` que no existía, causando un error al cargar los detalles del dashboard.
--   El nombre correcto de la columna es `w.layout`.
--   
--   Esta migración reemplaza la función existente con una versión corregida que:
--     1. Selecciona la columna `w.layout`.
--     2. Renombra `w.layout` como `position` en el objeto JSON de salida para que 
--        coincida con las expectativas del frontend.
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
                        'title', w.title,
                        'type', w.type,
                        'query', w.query,
                        'options', w.options,
                        'created_at', w.created_at,
                        'position', w.layout -- ¡CORREGIDO! Usa `layout` y lo renombra a `position`.
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
