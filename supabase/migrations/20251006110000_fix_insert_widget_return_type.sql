BEGIN;

-- =====================================================================================
-- MIGRACIÓN: Corregir el tipo de retorno de la función insert_widget
-- FECHA: 2025-10-06
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Modificar la función insert_widget para que devuelva el widget recién creado.
--            Esto es crucial para que el frontend pueda recibir el nuevo widget y añadirlo
--            al estado local sin necesidad de volver a cargar todos los datos, solucionando
--            el error "Could not find the function" que ocurría porque el cliente esperaba
--            un retorno y la función devolvía `void`.
-- =====================================================================================

-- Primero, eliminamos la función existente de forma segura.
DROP FUNCTION IF EXISTS public.insert_widget(uuid, text, jsonb, jsonb);

-- Volvemos a crear la función con la corrección en el tipo de retorno.
CREATE OR REPLACE FUNCTION public.insert_widget(
    p_dashboard_id uuid,
    p_widget_type text,
    p_config jsonb,
    p_layout jsonb
)
RETURNS SETOF be_exponential.report_widgets -- CAMBIO CLAVE: Devolvemos el tipo de la tabla.
LANGUAGE plpgsql
AS $$
BEGIN
    -- Usamos RETURN QUERY con INSERT ... RETURNING * para devolver la fila insertada.
    RETURN QUERY
    INSERT INTO be_exponential.report_widgets(dashboard_id, type, title, query, options, config, layout)
    VALUES (
        p_dashboard_id,
        p_widget_type::be_exponential.widget_type,
        p_config->>'title', -- Extraer el título del JSON
        p_config->>'query',
        p_config->'options',
        p_config, -- Guardar el config completo también
        p_layout
    )
    RETURNING *; -- Devolvemos todos los campos de la fila recién insertada.
END;
$$;

COMMIT;