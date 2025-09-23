
-- File: supabase/migrations/20251024100000_create_get_synced_table_data_function.sql

CREATE OR REPLACE FUNCTION get_synced_table_data(table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    data JSON;
    query TEXT;
BEGIN
    -- Validate that the table exists in the clickup_data schema to prevent unauthorized access
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'clickup_data' AND table_name = table_name
    ) THEN
        RAISE EXCEPTION 'Table not found or access denied.';
    END IF;

    -- Build the dynamic query safely
    query := format('SELECT json_agg(t) FROM clickup_data.%I AS t', table_name);

    -- Execute the query
    EXECUTE query INTO data;

    RETURN data;
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.get_synced_table_data(TEXT) TO authenticated;
