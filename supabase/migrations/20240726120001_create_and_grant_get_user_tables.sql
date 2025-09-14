CREATE OR REPLACE FUNCTION public.get_user_tables()
RETURNS TABLE(table_name text)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    t.table_name::text
  FROM
    information_schema.tables t
  WHERE
    t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    -- Excluir tablas internas de Supabase y de la aplicación
    AND t.table_name NOT IN ('reports', 'report_widgets', 'dashboards')
    AND NOT t.table_name LIKE 'pg_%'
    AND NOT t.table_name LIKE 'sql_%';
$$;

GRANT EXECUTE ON FUNCTION public.get_user_tables() TO authenticated;
