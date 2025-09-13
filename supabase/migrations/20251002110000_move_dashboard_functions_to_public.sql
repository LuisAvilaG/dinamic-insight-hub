-- migrations/20251002110000_move_dashboard_functions_to_public.sql

-- =====================================================================================
-- MIGRACIÓN PARA MOVER FUNCIONES CRUD DE DASHBOARDS AL ESQUEMA PUBLIC
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Mover las funciones RPC del esquema 'be_exponential' al esquema 'public'
--            para que sean accesibles desde el cliente de Supabase, que busca en
--            'public' por defecto. Las funciones seguirán operando sobre las tablas
--            en el esquema 'be_exponential'.
-- =====================================================================================

-- 1. Eliminar las funciones anteriores del esquema be_exponential (si existen)
DROP FUNCTION IF EXISTS be_exponential.get_dashboards();
DROP FUNCTION IF EXISTS be_exponential.create_dashboard(p_name TEXT, p_description TEXT);

-- 2. Crear la función para obtener dashboards en el esquema public
-- Esta función accede a la tabla en el esquema be_exponential.
CREATE OR REPLACE FUNCTION public.get_dashboards()
RETURNS SETOF be_exponential.report_dashboards
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM be_exponential.report_dashboards ORDER BY created_at DESC;
$$;

-- 3. Crear la función para crear dashboards en el esquema public
-- Esta función inserta en la tabla del esquema be_exponential.
CREATE OR REPLACE FUNCTION public.create_dashboard(p_name TEXT, p_description TEXT)
RETURNS be_exponential.report_dashboards
LANGUAGE sql
VOLATILE
AS $$
  INSERT INTO be_exponential.report_dashboards(name, description)
  VALUES (p_name, p_description)
  RETURNING *;
$$;
