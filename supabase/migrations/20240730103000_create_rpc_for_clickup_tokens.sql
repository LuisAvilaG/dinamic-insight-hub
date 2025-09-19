
-- Function to save or update a user's ClickUp token
CREATE OR REPLACE FUNCTION save_user_clickup_token(api_token_value TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO clickup.user_clickup_tokens (user_id, api_token)
  VALUES (auth.uid(), api_token_value)
  ON CONFLICT (user_id)
  DO UPDATE SET api_token = EXCLUDED.api_token, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION save_user_clickup_token(TEXT) TO authenticated;


-- Function to get the current user's ClickUp token
CREATE OR REPLACE FUNCTION get_user_clickup_token()
RETURNS TABLE(api_token TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT t.api_token
  FROM clickup.user_clickup_tokens t
  WHERE t.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION get_user_clickup_token() TO authenticated;
