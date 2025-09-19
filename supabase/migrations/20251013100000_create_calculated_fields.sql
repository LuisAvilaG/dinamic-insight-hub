-- =====================================================================================
-- MIGRACIÓN: Crear la tabla para Campos Calculados y la función de validación
-- FECHA: 2025-10-13
-- AUTOR: AI Assistant
-- PROPÓSITO: Establecer la infraestructura de base de datos para la funcionalidad de
--            campos calculados. Esto incluye una nueva tabla para almacenar las
--            expresiones creadas por los usuarios y una función RPC para validarlas
--            de forma segura antes de guardarlas.
-- =====================================================================================

-- PASO 1: Crear la nueva tabla `calculated_fields` en el esquema `be_exponential`
CREATE TABLE be_exponential.calculated_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    expression TEXT NOT NULL,
    tables_used TEXT[] NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Añadir comentarios para claridad
COMMENT ON TABLE be_exponential.calculated_fields IS 'Almacena las expresiones SQL personalizadas creadas por los usuarios para ser usadas en los widgets.';
COMMENT ON COLUMN be_exponential.calculated_fields.name IS 'El nombre legible que el usuario le da al campo calculado.';
COMMENT ON COLUMN be_exponential.calculated_fields.expression IS 'La expresión SQL cruda que define el cálculo.';
COMMENT ON COLUMN be_exponential.calculated_fields.tables_used IS 'Un array de las tablas (schema.table) necesarias para la expresión.';
COMMENT ON COLUMN be_exponential.calculated_fields.user_id IS 'El usuario que creó y es dueño de este campo calculado.';

-- Habilitar RLS (Row Level Security) en la nueva tabla
ALTER TABLE be_exponential.calculated_fields ENABLE ROW LEVEL SECURITY;

-- Crear políticas de RLS: Los usuarios solo pueden ver y modificar sus propios campos calculados
CREATE POLICY "Los usuarios pueden gestionar sus propios campos calculados"
ON be_exponential.calculated_fields
FOR ALL
USING (auth.uid() = user_id);

-- Crear un trigger para actualizar automáticamente el campo `updated_at`
CREATE OR REPLACE FUNCTION be_exponential.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_calculated_fields_update
BEFORE UPDATE ON be_exponential.calculated_fields
FOR EACH ROW
EXECUTE PROCEDURE be_exponential.handle_updated_at();


-- PASO 2: Crear la función `validate_sql_expression` para la validación segura
CREATE OR REPLACE FUNCTION public.validate_sql_expression(
    p_expression TEXT,
    p_tables TEXT[]
)
RETURNS JSON
STABLE
LANGUAGE plpgsql
AS $$
DECLARE
    subquery TEXT;
    final_query TEXT;
    table_identifier TEXT;
    schema_part TEXT;
    table_part TEXT;
    select_clauses TEXT[];
BEGIN
    -- Construir una subconsulta UNION ALL para simular la estructura de datos
    -- a partir de la cual se seleccionará la expresión.
    FOREACH table_identifier IN ARRAY p_tables
    LOOP
        schema_part := SPLIT_PART(table_identifier, '.', 1);
        table_part := SPLIT_PART(table_identifier, '.', 2);
        select_clauses := array_append(select_clauses, 'SELECT * FROM "' || schema_part || '"."' || table_part || '"');
    END LOOP;
    
    subquery := array_to_string(select_clauses, ' UNION ALL ');

    -- Construir la consulta final que intentará ejecutar la expresión sobre un conjunto vacío.
    final_query := 'SELECT ' || p_expression || ' FROM (' || subquery || ') as data LIMIT 0';

    -- Intentar ejecutar la consulta. Si falla, el bloque de excepción capturará el error.
    EXECUTE final_query;

    -- Si la ejecución llega hasta aquí, la sintaxis es válida.
    RETURN json_build_object('valid', true, 'error', null);

EXCEPTION
    -- Si ocurre un error durante la ejecución (ej: error de sintaxis), capturarlo.
    WHEN others THEN
        -- Devolver un JSON indicando que la validación falló, junto con el mensaje de error.
        RETURN json_build_object('valid', false, 'error', SQLERRM);
END;
$$;
