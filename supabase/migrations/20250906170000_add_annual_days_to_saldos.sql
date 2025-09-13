
-- =====================================================================================
-- MIGRACIÓN PARA AÑADIR LA COLUMNA DE DÍAS ANUALES DISPONIBLES
-- FECHA: 2025-09-06
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Añadir la columna `dias_disponibles_anual` a la tabla `vacaciones_saldos`.
--            Esta columna es necesaria para la lógica que crea un registro de saldo
--            si no existe, y es la causa del último error.
-- =====================================================================================

ALTER TABLE public.vacaciones_saldos
ADD COLUMN IF NOT EXISTS dias_disponibles_anual INTEGER NOT NULL DEFAULT 21;

COMMENT ON COLUMN public.vacaciones_saldos.dias_disponibles_anual IS 'El número total de días de vacaciones que un empleado tiene por año. El valor por defecto es 21.';

-- =====================================================================================
