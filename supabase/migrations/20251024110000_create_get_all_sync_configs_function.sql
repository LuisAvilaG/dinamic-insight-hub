
-- File: supabase/migrations/20251024110000_create_get_all_sync_configs_function.sql

-- Drop the old function first to ensure a clean replacement with the correct signature.
DROP FUNCTION IF EXISTS public.get_all_sync_configs();

-- Create the new, corrected function
CREATE OR REPLACE FUNCTION get_all_sync_configs()
-- The returned columns must match the actual schema: name and target_table
RETURNS TABLE(id uuid, name text, target_table text)
LANGUAGE plpgsql
SECURITY DEFINER -- Use the permissions of the function owner to access the clickup schema
AS $$
BEGIN
    RETURN QUERY
    -- Select the correct columns: s.name and s.target_table
    SELECT s.id, s.name, s.target_table
    FROM clickup.sync_configs s
    ORDER BY s.created_at DESC;
END;
$$;

-- Grant authenticated users permission to call this function
GRANT EXECUTE ON FUNCTION public.get_all_sync_configs() TO authenticated;
