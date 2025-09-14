CREATE OR REPLACE FUNCTION be_exponential.delete_widget(p_widget_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM be_exponential.report_widgets
    WHERE id = p_widget_id;
END;
$$ LANGUAGE plpgsql;