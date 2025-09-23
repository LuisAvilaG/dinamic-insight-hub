
-- File: supabase/migrations/20251024130000_apply_security_definer_to_data_viewer_function.sql

-- Drop the previous function to ensure we can re-create it with new security settings
DROP FUNCTION IF EXISTS public.get_synced_table_data(TEXT);

-- Recreate the function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION get_synced_table_data(p_table_name TEXT)
RETURNS JSON
LANGUAGE plpgsql
-- Add SECURITY DEFINER to run the function with the owner's elevated permissions.
-- This is necessary to access the restricted 'clickup_data' schema.
SECURITY DEFINER
AS $$
DECLARE
    data JSON;
    query TEXT;
BEGIN
    -- This check will now run with permissions that can see the 'clickup_data' schema.
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'clickup_data' AND table_name = p_table_name
    ) THEN
        RAISE EXCEPTION 'Table not found or access denied.';
    END IF;

    query := format('SELECT json_agg(t) FROM clickup_data.%I AS t', p_table_name);

    EXECUTE query INTO data;

    RETURN data;
END;
$$;

-- Grant usage to authenticated users so they can call the function
GRANT EXECUTE ON FUNCTION public.get_synced_table_data(TEXT) TO authenticated;
