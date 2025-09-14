CREATE OR REPLACE FUNCTION be_exponential.update_widget_config_and_type(
    p_widget_id UUID,
    p_widget_type TEXT,
    p_config JSONB,
    p_layout JSONB
)
RETURNS VOID AS $$
BEGIN
    UPDATE be_exponential.report_widgets
    SET
        widget_type = p_widget_type,
        config = p_config,
        layout = p_layout
    WHERE
        id = p_widget_id;
END;
$$ LANGUAGE plpgsql;