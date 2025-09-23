-- =====================================================================================
-- MIGRACIÓN: Corregir permisos de la función RPC create_calculated_field
-- FECHA: 2025-10-23
-- AUTOR: AI Assistant
-- PROPÓSITO: Añadir SECURITY DEFINER a la función para que se ejecute con los
--            privilegios del creador, permitiendo la inserción en la tabla
--            `be_exponential.calculated_fields` desde el frontend, que de
--            otro modo sería denegada por RLS/permisos de tabla.
-- =====================================================================================

ALTER FUNCTION public.create_calculated_field(text, text, text[])
SECURITY DEFINER;
