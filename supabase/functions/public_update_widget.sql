CREATE OR REPLACE FUNCTION public.update_widget(
    p_widget_id uuid,
    p_config jsonb,
    p_layout jsonb
)
RETURNS SETOF be_exponential.report_widgets
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    UPDATE be_exponential.report_widgets
    SET
        config = p_config,
        layout = p_layout,
        updated_at = now()
    WHERE id = p_widget_id
    RETURNING *;
END;
$$;