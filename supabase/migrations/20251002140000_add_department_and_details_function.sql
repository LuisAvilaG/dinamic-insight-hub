-- migrations/20251002140000_add_department_and_details_function.sql

-- =====================================================================================
-- MIGRACIÓN PARA AÑADIR DEPARTAMENTOS Y CORREGIR BUG DE CARGA DE DETALLES
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO:
--   1. Añadir un campo 'department' a los dashboards para permitir la segmentación.
--   2. Actualizar la función de creación para que acepte el nuevo campo de departamento.
--   3. Crear una nueva función RPC 'get_dashboard_details' para cargar un dashboard
--      individual junto con sus widgets asociados. Esto corrige de raíz el error 
--      persistente de `schema is not a function` que ocurre en la vista de detalle.
-- =====================================================================================

-- PARTE 1: Añadir campo de Departamento

-- 1. Añadir la columna 'department' a la tabla de dashboards si no existe.
ALTER TABLE be_exponential.report_dashboards
ADD COLUMN IF NOT EXISTS department TEXT;

-- 2. Re-crear la función para crear dashboards para que acepte el departamento.
--    Primero, se elimina la versión antigua para evitar conflictos.
DROP FUNCTION IF EXISTS public.create_dashboard(p_name TEXT, p_description TEXT);
CREATE OR REPLACE FUNCTION public.create_dashboard(p_name TEXT, p_description TEXT, p_department TEXT)
RETURNS be_exponential.report_dashboards
LANGUAGE sql
VOLATILE
AS $$
  INSERT INTO be_exponential.report_dashboards(name, description, department)
  VALUES (p_name, p_description, p_department)
  RETURNING *;
$$;

-- PARTE 2: Crear función de detalle para corregir el bug de carga

-- 3. Crear una función RPC para obtener los detalles de un dashboard y sus widgets.
--    Devuelve un único objeto JSON con el dashboard y un array anidado de widgets.
-- =====================================================================================
-- CORRECCIÓN FINAL: La función original fallaba porque intentaba acceder a una columna
-- `w.position` que no existía (el nombre correcto era `w.layout`). Esta nueva versión:
--   - Selecciona explícitamente las columnas del widget.
--   - Renombra `layout` a `position` para que coincida con lo que el frontend espera.
--   - Ordena los widgets por su posición en la pantalla (primero por fila, luego por columna).
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
