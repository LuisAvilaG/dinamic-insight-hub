-- Corrije la función RPC validate_sql_expression para que maneje nombres de columna cualificados (schema.table.column).
-- Esto permite que la validación funcione con las mismas etiquetas que usa el frontend, solucionando el bug "column does not exist".

CREATE OR REPLACE FUNCTION public.validate_sql_expression(p_expression text, p_tables text[])
 RETURNS json
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    subquery TEXT;
    table_identifier TEXT;
    schema_part TEXT;
    table_part TEXT;
    select_clauses TEXT[] := '{}';
    aliased_columns TEXT;
BEGIN
    -- 1. Construir una subconsulta que simula la estructura de datos exacta que el frontend espera.
    -- Para cada tabla, se seleccionan sus columnas y se les asigna un alias con el formato "schema.table.column".
    FOREACH table_identifier IN ARRAY p_tables
    LOOP
        schema_part := SPLIT_PART(table_identifier, '.', 1);
        table_part := SPLIT_PART(table_identifier, '.', 2);

        -- Construir la lista de columnas con alias para la tabla actual.
        SELECT string_agg(
            FORMAT('"%s" AS "%s"', c.column_name, table_identifier || '.' || c.column_name),
            ', '
        )
        INTO aliased_columns
        FROM information_schema.columns c
        WHERE c.table_schema = schema_part AND c.table_name = table_part;

        -- Añadir la cláusula SELECT para esta tabla a nuestro array de cláusulas.
        IF aliased_columns IS NOT NULL THEN
            select_clauses := array_append(select_clauses, FORMAT('SELECT %s FROM "%s"."%s"', aliased_columns, schema_part, table_part));
        END IF;
    END LOOP;
    
    -- Unir todas las cláusulas SELECT con UNION ALL para formar la subconsulta completa.
    subquery := array_to_string(select_clauses, ' UNION ALL ');

    -- 2. Validar la expresión del usuario contra esta subconsulta vacía.
    -- Si la expresión es sintácticamente correcta con los nombres de columna con alias, esto funcionará.
    -- Si no, lanzará una excepción.
    EXECUTE 'SELECT ' || p_expression || ' FROM (' || subquery || ') as data LIMIT 0';

    -- 3. Si la ejecución llega aquí, la sintaxis es válida.
    RETURN json_build_object('valid', true, 'error', null);

EXCEPTION
    -- Si ocurre un error de sintaxis (ej. la columna no existe en los alias), se captura aquí.
    WHEN others THEN
        RETURN json_build_object('valid', false, 'error', SQLERRM);
END;
$function$;
