-- supabase/migrations/YYYYMMDDHHMMSS_add_force_reset_sync_function.sql

CREATE OR REPLACE FUNCTION public.force_reset_sync_status(sync_id_to_reset uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- We are using the clickup schema, so we need to set the search path
  -- The security definer context will ensure permissions.
  SET search_path = clickup;

  UPDATE sync_configs
  SET 
    status = 'failed',
    last_run_result = 'Manually reset by user from a stuck "running" state.'
  WHERE id = sync_id_to_reset AND status = 'running';
END;
$$;

GRANT EXECUTE ON FUNCTION public.force_reset_sync_status(uuid) TO authenticated;
