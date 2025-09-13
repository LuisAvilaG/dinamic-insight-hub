
-- =====================================================================================
-- MIGRACIÓN PARA LA RENOVACIÓN AUTOMÁTICA DE VACACIONES (VERSIÓN FINAL CORREGIDA)
-- FECHA: 2025-09-07
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: 1. Crear la función `renovar_vacaciones_anualmente`.
--            2. Activar y configurar `pg_cron` para que la ejecute diariamente.
-- CORRECCIÓN 3: Hacer la desprogramación de la tarea idempotente usando un bloque DO/EXCEPTION.
-- =====================================================================================

BEGIN;

-- PASO 1: CREAR LA FUNCIÓN DE LÓGICA DE NEGOCIO (Sin cambios)
CREATE OR REPLACE FUNCTION public.renovar_vacaciones_anualmente()
RETURNS void AS $$
DECLARE
  empleado RECORD;
BEGIN
  FOR empleado IN
    SELECT user_id, fecha_inicio_labores, dias_disponibles_anual
    FROM public.vacaciones_saldos
    WHERE fecha_inicio_labores IS NOT NULL
  LOOP
    IF to_char(CURRENT_DATE, 'MM-DD') = to_char(empleado.fecha_inicio_labores, 'MM-DD') THEN
      IF CURRENT_DATE > empleado.fecha_inicio_labores THEN
        RAISE NOTICE 'Aniversario detectado para el usuario %.', empleado.user_id;
        UPDATE public.vacaciones_saldos
        SET 
          dias_tomados = 0,
          dias_disponibles_anual = dias_disponibles_anual + 2
        WHERE user_id = empleado.user_id;
        RAISE NOTICE 'Saldo de vacaciones renovado para el usuario %.', empleado.user_id;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- PASO 2: ACTIVAR LA EXTENSIÓN pg_cron (Sin cambios)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- PASO 3: PROGRAMAR LA TAREA DIARIA (MÉTODO IDEMPOTENTE Y SEGURO)
DO $$
BEGIN
    -- Intentar desprogramar la tarea. Si no existe, la excepción lo manejará sin detener el script.
    PERFORM cron.unschedule('renovacion_vacaciones_diaria');
EXCEPTION 
    -- Cuando `unschedule` no encuentra el job, lanza una excepción. La capturamos para ignorarla.
    WHEN OTHERS THEN
        RAISE NOTICE 'La tarea "renovacion_vacaciones_diaria" no existía previamente. Se creará una nueva.';
END;
$$;

-- Volver a programar la tarea. Esto asegura que siempre esté actualizada con la última definición de la función.
SELECT cron.schedule(
  'renovacion_vacaciones_diaria', -- Nombre de la tarea
  '0 5 * * *', -- Cron: Todos los días a las 5:00 AM UTC
  $$ SELECT public.renovar_vacaciones_anualmente(); $$ -- Comando a ejecutar
);

COMMIT;
