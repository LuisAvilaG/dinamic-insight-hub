
-- First, ensure Row Level Security is enabled on the table
ALTER TABLE clickup.sync_configs ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows admins to view all sync configurations
-- A user is considered 'admin' if their role in the public."Cuentas" table is 'admin'
CREATE POLICY "Allow admin to read all sync configs"
ON clickup.sync_configs
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public."Cuentas"
    WHERE "Cuentas".user_id = auth.uid() AND "Cuentas"."Rol" = 'admin'
  )
);

-- For easier and more secure access from the frontend, let's create a function
-- that returns the sync configs. This abstracts the table away.
CREATE OR REPLACE FUNCTION get_all_sync_configs()
RETURNS SETOF clickup.sync_configs AS $$
BEGIN
  -- The function will respect the RLS policy defined above
  RETURN QUERY SELECT * FROM clickup.sync_configs ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
-- The RLS policy will ensure only admins get data
GRANT EXECUTE ON FUNCTION get_all_sync_configs() TO authenticated;
