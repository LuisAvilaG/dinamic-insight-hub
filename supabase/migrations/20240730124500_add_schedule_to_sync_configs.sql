-- Add a column to store the cron schedule string
ALTER TABLE clickup.sync_configs
ADD COLUMN cron_schedule TEXT;

-- Add a column to store more detailed configuration as JSONB
ALTER TABLE clickup.sync_configs
ADD COLUMN config JSONB;

-- Update the get_all_sync_configs function to include the new columns
CREATE OR REPLACE FUNCTION get_all_sync_configs()
RETURNS SETOF clickup.sync_configs AS $$
BEGIN
  RETURN QUERY SELECT * FROM clickup.sync_configs ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
