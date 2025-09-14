CREATE OR REPLACE FUNCTION public.insert_widget(
    p_dashboard_id uuid,
    p_widget_type_text text,
    p_config jsonb,
    p_layout jsonb
)
RETURNS SETOF be_exponential.report_widgets 
LANGUAGE plpgsql
AS $$
BEGIN
    -- La columna correcta es "widget_type", no "type". El input de texto se castea al tipo ENUM.
    RETURN QUERY
    INSERT INTO be_exponential.report_widgets(dashboard_id, widget_type, config, layout)
    VALUES (
        p_dashboard_id,
        p_widget_type_text::be_exponential.widget_type, 
        p_config,
        p_layout
    )
    RETURNING *;
END;
$$;