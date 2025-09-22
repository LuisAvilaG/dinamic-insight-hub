CREATE OR REPLACE FUNCTION get_dashboards_by_department(p_department TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  department TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.name,
    t.description,
    t.department,
    t.created_at,
    t.updated_at
  FROM be_exponential.report_dashboards AS t
  WHERE t.department = p_department
  ORDER BY t.updated_at DESC;
END;
$$ LANGUAGE plpgsql;
