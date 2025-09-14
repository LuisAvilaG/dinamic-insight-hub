-- =====================================================================================
-- MIGRACIÓN: Crear la función insert_widget
-- FECHA: 2025-10-04
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Solucionar el error 404 al crear widgets. Esta función RPC permite
--            insertar un widget en la tabla be_exponential.report_widgets de forma segura
--            desde el frontend, sin necesidad de exponer la tabla directamente a la API REST.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.insert_widget(
    p_dashboard_id UUID,
    p_widget_type TEXT,
    p_config JSONB,
    p_layout JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- La función se ejecuta con los permisos del creador (SECURITY DEFINER),
    -- lo que le permite escribir en el esquema be_exponential, aunque el usuario
    -- autenticado no tenga permisos directos de inserción sobre la tabla.
    INSERT INTO be_exponential.report_widgets (dashboard_id, widget_type, config, layout)
    VALUES (p_dashboard_id, p_widget_type, p_config, p_layout);
END;
$$;

-- Otorgar permisos al rol 'authenticated' para que los usuarios logueados puedan llamar a esta función.
GRANT EXECUTE ON FUNCTION public.insert_widget(UUID, TEXT, JSONB, JSONB) TO authenticated;
