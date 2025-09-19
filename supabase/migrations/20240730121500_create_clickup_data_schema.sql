-- Create the schema to hold dynamically generated tables
CREATE SCHEMA IF NOT EXISTS clickup_data;

-- Grant usage to the authenticated role
GRANT USAGE ON SCHEMA clickup_data TO authenticated;

-- Allow the service_role (used by Edge Functions) to create and manage tables in this schema
GRANT ALL ON SCHEMA clickup_data TO service_role;
