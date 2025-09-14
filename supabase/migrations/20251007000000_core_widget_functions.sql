-- 1. CREACIÓN DE LA FUNCIÓN PARA INSERTAR WIDGETS
-- =====================================================================================
-- Crea o reemplaza la función para insertar un nuevo widget. Esta es la versión
-- corregida y definitiva que soluciona los errores de "columna no encontrada".
--
-- Parámetros:
--   p_dashboard_id: El UUID del dashboard al que pertenece el widget.
--   p_widget_type_text: El tipo de widget (ej. 'kpi', 'table') como texto.
--   p_config: Un JSONB con la configuración del widget (título, consulta SQL).
--   p_layout: Un JSONB con la información de la posición y tamaño del widget.
--
-- Retorna: La fila completa del widget recién insertado.
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

-- 2. CREACIÓN DE LA FUNCIÓN PARA ACTUALIZAR WIDGETS
-- =====================================================================================
-- Crea o reemplaza la función para actualizar un widget existente.
--
-- Parámetros:
--   p_widget_id: El UUID del widget a actualizar.
--   p_config: El nuevo JSONB de configuración.
--   p_layout: El nuevo JSONB de layout.
--
-- Retorna: La fila completa del widget actualizado.
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
