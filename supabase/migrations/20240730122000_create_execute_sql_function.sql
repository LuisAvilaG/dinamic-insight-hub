
CREATE OR REPLACE FUNCTION execute_sql(sql TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to the service_role so Edge Functions can use it
GRANT EXECUTE ON FUNCTION execute_sql(TEXT) TO service_role;
