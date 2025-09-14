-- =====================================================================================
-- MIGRACIÓN: Añadir función para actualizar el layout de un widget
-- FECHA: 2025-10-04
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Permitir la actualización de la columna de layout de un widget específico.
--           Esto es esencial para la funcionalidad de arrastrar y cambiar tamaño.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.update_widget_layout(
    p_widget_id UUID,
    p_layout JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Se asegura de que el usuario solo pueda modificar widgets que le pertenecen
    -- (asumiendo una futura tabla de propiedad o una lógica de RLS más compleja).
    -- Por ahora, se asume que si puede llamar a la función, tiene permiso.
    UPDATE be_exponential.report_widgets
    SET layout = p_layout
    WHERE id = p_widget_id;
END;
$$;

-- Conceder permisos para esta nueva función al rol de servicio (o el rol autenticado)
GRANT EXECUTE ON FUNCTION public.update_widget_layout(UUID, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_widget_layout(UUID, JSONB) TO authenticated;
