-- migrations/20251002100000_create_dashboard_crud_functions.sql

-- =====================================================================================
-- MIGRACIÓN PARA FUNCIONES CRUD DE DASHBOARDS
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Crear funciones RPC para manejar operaciones CRUD en la tabla 
--            report_dashboards dentro del schema be_exponential. Esto corrige
--            un uso incorrecto de la librería de cliente de Supabase que no
--            permite especificar esquemas por consulta en el método .from().
-- =====================================================================================

-- 1. Función para obtener todos los dashboards
-- Devuelve un conjunto de filas que coinciden con la tabla report_dashboards.
CREATE OR REPLACE FUNCTION be_exponential.get_dashboards()
RETURNS SETOF be_exponential.report_dashboards
LANGUAGE sql
STABLE -- Indica que la función no modifica la base de datos.
AS $$
  SELECT * FROM be_exponential.report_dashboards ORDER BY created_at DESC;
$$;

-- 2. Función para crear un nuevo dashboard
-- Acepta nombre y descripción, inserta en la tabla y devuelve la nueva fila creada.
CREATE OR REPLACE FUNCTION be_exponential.create_dashboard(p_name TEXT, p_description TEXT)
RETURNS be_exponential.report_dashboards -- Devuelve un único registro.
LANGUAGE sql
VOLATILE -- Indica que la función modifica la base de datos.
AS $$
  INSERT INTO be_exponential.report_dashboards(name, description)
  VALUES (p_name, p_description)
  RETURNING *;
$$;
