
-- File: supabase/migrations/20251024120000_fix_get_synced_table_data_ambiguity.sql

-- Drop the previous function to avoid conflicts
DROP FUNCTION IF EXISTS public.get_synced_table_data(TEXT);

-- Recreate the function with a non-ambiguous parameter name (p_table_name)
CREATE OR REPLACE FUNCTION get_synced_table_data(p_table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    data JSON;
    query TEXT;
BEGIN
    -- Validate that the table exists in the clickup_data schema to prevent unauthorized access
    -- The check now compares the system column 'table_name' with our unique parameter 'p_table_name'
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'clickup_data' AND table_name = p_table_name
    ) THEN
        RAISE EXCEPTION 'Table not found or access denied.';
    END IF;

    -- Build the dynamic query safely using the non-ambiguous parameter
    query := format('SELECT json_agg(t) FROM clickup_data.%I AS t', p_table_name);

    -- Execute the query
    EXECUTE query INTO data;

    RETURN data;
END;
$$;

-- Grant usage to authenticated users
GRANT EXECUTE ON FUNCTION public.get_synced_table_data(TEXT) TO authenticated;
