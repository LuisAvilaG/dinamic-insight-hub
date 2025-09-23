
-- File: supabase/migrations/20251024140000_add_pagination_to_data_viewer.sql

-- Drop the previous function to ensure we can re-create it with new parameters and a new return type.
DROP FUNCTION IF EXISTS public.get_synced_table_data(TEXT);

-- Recreate the function to support pagination (page size and number)
CREATE OR REPLACE FUNCTION get_synced_table_data(
    p_table_name TEXT,
    p_page_size INT,
    p_page_number INT
)
-- The function will now return a single JSON object containing both the data and the total count.
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    data_payload JSON;
    total_count BIGINT;
    query TEXT;
    offset_val INT;
BEGIN
    -- First, validate that the table exists and the user has access.
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'clickup_data' AND table_name = p_table_name
    ) THEN
        RAISE EXCEPTION 'Table not found or access denied.';
    END IF;

    -- Calculate the OFFSET for pagination.
    offset_val := (p_page_number - 1) * p_page_size;

    -- Build the query to fetch a specific page of data.
    query := format(
        'SELECT json_agg(t) FROM (SELECT * FROM clickup_data.%I ORDER BY 1 LIMIT %L OFFSET %L) AS t',
        p_table_name, p_page_size, offset_val
    );
    EXECUTE query INTO data_payload;

    -- Build and execute a separate query to get the total row count for the table.
    query := format('SELECT count(*) FROM clickup_data.%I', p_table_name);
    EXECUTE query INTO total_count;

    -- Combine the data and total count into a single JSON object to return.
    RETURN json_build_object(
        'data', data_payload,
        'total_count', total_count
    );
END;
$$;

-- Grant usage to authenticated users. Note the new function signature with three arguments.
GRANT EXECUTE ON FUNCTION public.get_synced_table_data(TEXT, INT, INT) TO authenticated;
