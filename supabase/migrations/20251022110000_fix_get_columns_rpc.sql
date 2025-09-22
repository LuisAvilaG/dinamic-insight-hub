-- Corrige la función RPC get_columns_from_tables para que el display_name
-- incluya el nombre del esquema, asegurando consistencia con el resto de la aplicación.
-- El formato ahora será "schema.table.column".

CREATE OR REPLACE FUNCTION public.get_columns_from_tables(p_tables text[])
 RETURNS TABLE(display_name text, schema_name text, table_name text, column_name text, data_type text)
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    table_identifier TEXT;
    schema_part TEXT;
    table_part TEXT;
BEGIN
    FOREACH table_identifier IN ARRAY p_tables
    LOOP
        schema_part := SPLIT_PART(table_identifier, '.', 1);
        table_part := SPLIT_PART(table_identifier, '.', 2);

        RETURN QUERY
        SELECT
            -- FIX: Incluir el nombre del esquema en el display_name para consistencia.
            table_identifier || '.' || c.column_name AS display_name,
            c.table_schema::TEXT AS schema_name,
            c.table_name::TEXT AS table_name,
            c.column_name::TEXT AS column_name,
            c.data_type::TEXT AS data_type
        FROM
            information_schema.columns c
        WHERE
            c.table_schema = schema_part
            AND c.table_name = table_part;
    END LOOP;
END;
$function$;
