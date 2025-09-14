-- =========================================================================================
-- ||                            FUNCIÓN PARA INSERTAR WIDGETS                            ||
-- =========================================================================================
-- ||
-- || DESCRIPCIÓN:
-- ||   Esta función RPC permite insertar un nuevo widget en un dashboard de forma segura.
-- ||   Toma como entrada el ID del dashboard, el tipo de widget, un objeto de configuración
-- ||   y un objeto de layout. Centraliza la lógica de inserción y se asegura de que solo
-- ||   usuarios autenticados puedan crear widgets.
-- ||
-- || AUTORIZACIÓN:
-- ||   La función comprueba que el `auth.uid()` del usuario que realiza la llamada no sea nulo.
-- ||   Esto restringe su uso a usuarios autenticados.
-- ||
-- =========================================================================================

CREATE OR REPLACE FUNCTION public.insert_widget(
    p_dashboard_id UUID,
    p_widget_type TEXT,
    p_config JSONB,
    p_layout JSONB
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- La seguridad a nivel de fila (RLS) en la tabla `report_widgets` se encargará de verificar
    -- si el usuario tiene permiso para insertar en el `dashboard_id` especificado.
    -- Esta función simplemente centraliza la operación de inserción.

    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'No autenticado: No se puede insertar el widget.';
    END IF;

    INSERT INTO be_exponential.report_widgets(dashboard_id, widget_type, config, layout)
    VALUES (p_dashboard_id, p_widget_type, p_config, p_layout);

END;
$$;