CREATE OR REPLACE FUNCTION be_exponential.update_widget_config_and_type(
    p_widget_id uuid,
    p_widget_type text,
    p_config jsonb
)
RETURNS void AS $$
BEGIN
    UPDATE be_exponential.report_widgets
    SET
        type = p_widget_type,
        config = p_config,
        title = p_config->>'title',
        query = p_config->>'query'
    WHERE id = p_widget_id;
END;
$$ LANGUAGE plpgsql;
