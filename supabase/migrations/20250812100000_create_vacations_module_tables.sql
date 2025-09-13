--- ========== TABLAS PARA EL MÓDULO DE GESTIÓN DE VACACIONES ========== ---

-- 1. Tabla para almacenar los saldos de vacaciones de cada usuario.
CREATE TABLE IF NOT EXISTS public.vacaciones_saldos (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dias_asignados INTEGER NOT NULL DEFAULT 21,
  dias_tomados INTEGER NOT NULL DEFAULT 0
);

-- 2. Tabla para definir la jerarquía de aprobación.
CREATE TABLE IF NOT EXISTS public.vacaciones_aprobadores (
  empleado_user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  aprobador_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 3. Tabla principal para las solicitudes de vacaciones.
CREATE TABLE IF NOT EXISTS public.vacaciones_solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_solicitados INTEGER NOT NULL,
  motivo TEXT,
  estado TEXT NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Aprobada', 'Rechazada')),
  aprobador_user_id UUID REFERENCES auth.users(id),
  comentarios_aprobador TEXT,
  fecha_decision TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


--- ========== FUNCIONES Y TRIGGERS PARA AUTOMATIZACIÓN ========== ---

-- 1. Función para actualizar automáticamente el saldo cuando se aprueba o cancela una solicitud.
CREATE OR REPLACE FUNCTION public.actualizar_saldo_vacaciones()
RETURNS TRIGGER AS $$
BEGIN
  -- Si una solicitud es APROBADA
  IF NEW.estado = 'Aprobada' AND OLD.estado <> 'Aprobada' THEN
    UPDATE public.vacaciones_saldos
    SET dias_tomados = dias_tomados + NEW.dias_solicitados
    WHERE user_id = NEW.solicitante_user_id;

  -- Si una solicitud que estaba APROBADA es RECHAZADA o cambiada a PENDIENTE (cancelación)
  ELSIF OLD.estado = 'Aprobada' AND NEW.estado <> 'Aprobada' THEN
    UPDATE public.vacaciones_saldos
    SET dias_tomados = dias_tomados - OLD.dias_solicitados
    WHERE user_id = OLD.solicitante_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger que llama a la función anterior cuando se actualiza una solicitud.
DROP TRIGGER IF EXISTS on_solicitud_update_actualizar_saldo ON public.vacaciones_solicitudes;
CREATE TRIGGER on_solicitud_update_actualizar_saldo
AFTER UPDATE ON public.vacaciones_solicitudes
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_saldo_vacaciones();

-- 3. Trigger para mantener el 'updated_at' actualizado.
DROP TRIGGER IF EXISTS on_vacaciones_solicitudes_update ON public.vacaciones_solicitudes;
CREATE TRIGGER on_vacaciones_solicitudes_update
BEFORE UPDATE ON public.vacaciones_solicitudes
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at(); -- Reutilizamos la función que ya existe


--- ========== POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY) ========== ---

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE public.vacaciones_saldos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacaciones_aprobadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacaciones_solicitudes ENABLE ROW LEVEL SECURITY;

-- Políticas para vacaciones_saldos
CREATE POLICY "Empleados pueden ver su propio saldo" ON public.vacaciones_saldos
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para vacaciones_aprobadores
CREATE POLICY "Usuarios pueden ver a quién aprueban y quién les aprueba" ON public.vacaciones_aprobadores
  FOR SELECT USING (auth.uid() = empleado_user_id OR auth.uid() = aprobador_user_id);

-- Políticas para vacaciones_solicitudes
CREATE POLICY "Empleados pueden crear y ver sus propias solicitudes" ON public.vacaciones_solicitudes
  FOR ALL USING (auth.uid() = solicitante_user_id);

CREATE POLICY "Aprobadores pueden ver las solicitudes de su equipo" ON public.vacaciones_solicitudes
  FOR SELECT USING (
    solicitante_user_id IN (SELECT empleado_user_id FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid())
  );

CREATE POLICY "Aprobadores pueden actualizar (aprobar/rechazar) solicitudes de su equipo" ON public.vacaciones_solicitudes
  FOR UPDATE USING (
    solicitante_user_id IN (SELECT empleado_user_id FROM public.vacaciones_aprobadores WHERE aprobador_user_id = auth.uid())
  ) WITH CHECK (
    estado IN ('Aprobada', 'Rechazada')
  );

--- Nota: Se necesitará una política para administradores de RH que les permita ver y gestionar todo.
--- Esto se agregará cuando se defina el rol 'Admin RH' en el sistema.
