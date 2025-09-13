
-- =====================================================================================
-- MIGRACIÓN PARA AÑADIR FECHA DE INICIO DE LABORES
-- FECHA: 2025-09-07
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Añadir la columna `fecha_inicio_labores` a la tabla `vacaciones_saldos`
--            para poder automatizar la renovación anual de vacaciones.
-- =====================================================================================

BEGIN;

ALTER TABLE public.vacaciones_saldos
ADD COLUMN IF NOT EXISTS fecha_inicio_labores DATE;

COMMIT;
