-- =====================================================================================
-- MIGRACIÓN: Crear la función RPC create_calculated_field
-- FECHA: 2025-10-23
-- AUTOR: AI Assistant
-- PROPÓSITO: Crear una función RPC segura para insertar nuevos campos calculados
--            en el esquema `be_exponential` desde el frontend, siguiendo el patrón
--            de arquitectura del proyecto.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.create_calculated_field(
    p_name TEXT,
    p_expression TEXT,
    p_tables_used TEXT[]
)
RETURNS void -- No necesita devolver nada
LANGUAGE plpgsql
AS $$
BEGIN
  -- La función inserta en la tabla correcta usando el ID del usuario autenticado.
  -- Esto respeta las políticas de RLS existentes que aseguran que un usuario
  -- solo puede crear campos para sí mismo.
  INSERT INTO be_exponential.calculated_fields(name, expression, tables_used, user_id)
  VALUES(p_name, p_expression, p_tables_used, auth.uid());
END;
$$;
