
-- =====================================================================================
-- MIGRACIÓN ROBUSTA PARA EL MÓDULO DE VACACIONES
-- FECHA: 2025-09-07
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Resolver problemas críticos detectados:
--            1. Permitir la cancelación de solicitudes (añadir estado 'Cancelada').
--            2. Prevenir la aprobación de solicitudes si el saldo es insuficiente.
--            3. Corregir el cálculo de días tomados para que sea siempre preciso.
--            4. Prevenir la creación de solicitudes si el saldo es insuficiente.
-- =====================================================================================

BEGIN;

-- PASO 1: CORREGIR LA RESTRICCIÓN DE ESTADOS
ALTER TABLE public.vacaciones_solicitudes DROP CONSTRAINT IF EXISTS vacaciones_solicitudes_estado_check;
ALTER TABLE public.vacaciones_solicitudes ADD CONSTRAINT vacaciones_solicitudes_estado_check
CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'));

-- PASO 2: CREAR UNA FUNCIÓN DE RECALCULO PRECISO DE DÍAS TOMADOS
CREATE OR REPLACE FUNCTION public.recalcular_dias_tomados(p_user_id UUID)
RETURNS void AS $$
DECLARE total_dias_aprobados INTEGER;
BEGIN
  SELECT COALESCE(SUM(dias_solicitados), 0)
  INTO total_dias_aprobados
  FROM public.vacaciones_solicitudes
  WHERE solicitante_user_id = p_user_id AND estado = 'Aprobada';
  UPDATE public.vacaciones_saldos SET dias_tomados = total_dias_aprobados WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: REEMPLAZAR EL ANTIGUO TRIGGER DE SALDO
CREATE OR REPLACE FUNCTION public.trigger_recalcular_saldo_despues_de_cambio()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.estado IS DISTINCT FROM NEW.estado THEN
    PERFORM public.recalcular_dias_tomados(NEW.solicitante_user_id);
    IF OLD.estado = 'Aprobada' THEN
        PERFORM public.recalcular_dias_tomados(OLD.solicitante_user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_solicitud_update_actualizar_saldo ON public.vacaciones_solicitudes;
CREATE TRIGGER on_solicitud_update_recalcular_saldo
AFTER UPDATE OR INSERT ON public.vacaciones_solicitudes
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalcular_saldo_despues_de_cambio();

-- PASO 4: CREAR FUNCIÓN DE SEGURIDAD PARA PREVENIR SALDO NEGATIVO (AL APROBAR)
CREATE OR REPLACE FUNCTION public.check_saldo_suficiente_antes_de_aprobar()
RETURNS TRIGGER AS $$
DECLARE
  dias_disponibles INTEGER;
  dias_tomados_actuales INTEGER;
  dias_asignados_anuales INTEGER;
BEGIN
  IF NEW.estado = 'Aprobada' AND OLD.estado <> 'Aprobada' THEN
    SELECT dias_disponibles_anual, dias_tomados INTO dias_asignados_anuales, dias_tomados_actuales
    FROM public.vacaciones_saldos WHERE user_id = NEW.solicitante_user_id;
    dias_disponibles := dias_asignados_anuales - dias_tomados_actuales;
    IF NEW.dias_solicitados > dias_disponibles THEN
      RAISE EXCEPTION 'No se puede aprobar. El empleado solo tiene % días disponibles, pero solicita %.', dias_disponibles, NEW.dias_solicitados;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_approve_check_saldo ON public.vacaciones_solicitudes;
CREATE TRIGGER before_approve_check_saldo
BEFORE UPDATE ON public.vacaciones_solicitudes
FOR EACH ROW EXECUTE FUNCTION public.check_saldo_suficiente_antes_de_aprobar();


-- =====================================================================================
-- PASO 5 (NUEVO): PREVENIR LA CREACIÓN DE SOLICITUDES CON SALDO INSUFICIENTE
-- Se ejecuta ANTES de insertar una nueva solicitud y la bloquea si no hay saldo.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.check_saldo_al_crear_solicitud()
RETURNS TRIGGER AS $$
DECLARE
  dias_disponibles INTEGER;
  dias_tomados_actuales INTEGER;
  dias_asignados_anuales INTEGER;
BEGIN
  SELECT dias_disponibles_anual, dias_tomados
  INTO dias_asignados_anuales, dias_tomados_actuales
  FROM public.vacaciones_saldos
  WHERE user_id = NEW.solicitante_user_id;

  IF NOT FOUND THEN
      RAISE EXCEPTION 'No se puede crear la solicitud. No tienes un registro de saldo de vacaciones asignado.';
  END IF;

  dias_disponibles := dias_asignados_anuales - dias_tomados_actuales;

  IF NEW.dias_solicitados > dias_disponibles THEN
    RAISE EXCEPTION 'No tienes suficientes días de vacaciones. Disponibles: %, Solicitados: %.', dias_disponibles, NEW.dias_solicitados;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Se crea el trigger que se activa ANTES de una inserción.
DROP TRIGGER IF EXISTS before_insert_check_saldo ON public.vacaciones_solicitudes;
CREATE TRIGGER before_insert_check_saldo
BEFORE INSERT ON public.vacaciones_solicitudes
FOR EACH ROW
EXECUTE FUNCTION public.check_saldo_al_crear_solicitud();

COMMIT;
