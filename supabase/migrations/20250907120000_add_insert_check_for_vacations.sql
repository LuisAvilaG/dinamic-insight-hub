
-- =====================================================================================
-- MIGRACIÓN ADICIONAL PARA VALIDACIÓN DE SALDO EN LA CREACIÓN
-- FECHA: 2025-09-07
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Prevenir la CREACIÓN de solicitudes si el saldo es insuficiente.
--            Esta lógica se separó en su propia migración para asegurar su aplicación.
-- =====================================================================================

BEGIN;

-- PASO 1: CREAR LA FUNCIÓN DE VALIDACIÓN
CREATE OR REPLACE FUNCTION public.check_saldo_al_crear_solicitud()
RETURNS TRIGGER AS $$
DECLARE
  dias_disponibles INTEGER;
  dias_tomados_actuales INTEGER;
  dias_asignados_anuales INTEGER;
BEGIN
  -- Obtener el saldo actual del usuario
  SELECT dias_disponibles_anual, dias_tomados
  INTO dias_asignados_anuales, dias_tomados_actuales
  FROM public.vacaciones_saldos
  WHERE user_id = NEW.solicitante_user_id;

  -- Si el usuario no tiene un registro de saldo, no puede crear solicitudes.
  IF NOT FOUND THEN
      RAISE EXCEPTION 'No se puede crear la solicitud. No tienes un registro de saldo de vacaciones asignado.';
  END IF;

  -- Calcular los días realmente disponibles
  dias_disponibles := dias_asignados_anuales - dias_tomados_actuales;

  -- Validar si los días que se solicitan superan los disponibles
  IF NEW.dias_solicitados > dias_disponibles THEN
    RAISE EXCEPTION 'No tienes suficientes días de vacaciones. Disponibles: %, Solicitados: %.', dias_disponibles, NEW.dias_solicitados;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 2: CREAR EL TRIGGER QUE SE ACTIVA ANTES DE UNA INSERCIÓN
DROP TRIGGER IF EXISTS before_insert_check_saldo ON public.vacaciones_solicitudes;
CREATE TRIGGER before_insert_check_saldo
BEFORE INSERT ON public.vacaciones_solicitudes
FOR EACH ROW
EXECUTE FUNCTION public.check_saldo_al_crear_solicitud();

COMMIT;
