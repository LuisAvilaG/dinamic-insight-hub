
-- File: supabase/migrations/20251024150000_create_sync_hub_details_function.sql

-- This function is specifically for the Sync Hub page and returns all necessary columns.
CREATE OR REPLACE FUNCTION get_sync_hub_details()
RETURNS TABLE (
    id uuid,
    name text,
    clickup_workspace_name text,
    clickup_space_name text,
    status text,
    last_run_at timestamptz,
    next_run_at timestamptz,
    is_active boolean,
    sync_type text,
    target_table text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.clickup_workspace_name,
        s.clickup_space_name,
        s.status,
        s.last_run_at,
        s.next_run_at,
        s.is_active,
        s.sync_type,
        s.target_table
    FROM
        clickup.sync_configs s
    ORDER BY
        s.created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sync_hub_details() TO authenticated;
