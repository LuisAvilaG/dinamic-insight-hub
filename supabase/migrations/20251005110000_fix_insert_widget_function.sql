-- =====================================================================================
-- MIGRACIÓN: Corregir la función insert_widget
-- FECHA: 2025-10-05
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Arreglar el error de casteo de tipo enum al insertar un widget.
--            La versión anterior no convertía el parámetro de texto al tipo
--            be_exponential.widget_type, causando un error. Esta versión lo corrige.
-- =====================================================================================

-- Se recomienda eliminar la función anterior si existe para evitar conflictos.
-- Esta sentencia es segura y no hará nada si la función no existe.
DROP FUNCTION IF EXISTS public.insert_widget(uuid, text, jsonb, jsonb);

-- Volver a crear la función con la corrección
CREATE OR REPLACE FUNCTION public.insert_widget(
    p_dashboard_id uuid,
    p_widget_type text, -- Recibimos el tipo como texto desde el frontend
    p_config jsonb,
    p_layout jsonb
)
RETURNS void -- No devuelve nada
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insertar en la tabla correcta, especificando el esquema
    INSERT INTO be_exponential.report_widgets(dashboard_id, type, title, query, options, layout)
    VALUES (
        p_dashboard_id,
        p_widget_type::be_exponential.widget_type, -- AQUÍ ESTÁ LA CORRECIÓN: Castear el texto al tipo enum
        p_config->>'title', -- Extraer el título del JSON
        p_config->>'query', -- Extraer la query del JSON
        p_config->'options',  -- Extraer el objeto de opciones del JSON
        p_layout
    );
END;
$$;