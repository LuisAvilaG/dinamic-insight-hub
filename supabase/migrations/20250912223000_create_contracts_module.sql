
-- ==================================================================
-- MIGRACIÓN: Módulo de Contratos y su Gestión
-- ==================================================================
-- Esta migración establece todo lo necesario para la gestión de 
-- contratos de empleados en la base de datos.
-- ==================================================================

-- PASO 1: Crear la tabla `contratos`
-- Esta tabla almacenará el historial de contratos de cada empleado.
CREATE TABLE IF NOT EXISTS public.contratos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public."Cuentas"(user_id) ON DELETE CASCADE,
    puesto VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    tipo_contrato VARCHAR(100), -- E.g., 'Indefinido', 'Temporal', 'Prácticas'
    es_activo BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Añadir comentarios para claridad
COMMENT ON TABLE public.contratos IS 'Almacena el historial de contratos laborales de los empleados.';
COMMENT ON COLUMN public.contratos.es_activo IS 'Indica si este es el contrato vigente para el usuario. Solo uno puede ser activo a la vez.';

-- PASO 2: Crear una función para asegurar un único contrato activo por usuario
-- Esta función se activará con un trigger para garantizar la integridad de los datos.
CREATE OR REPLACE FUNCTION public.ensure_single_active_contract()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el nuevo contrato se está marcando como activo,
    -- se deben desactivar todos los demás contratos para ese mismo usuario.
    IF NEW.es_activo = true THEN
        UPDATE public.contratos
        SET es_activo = false
        WHERE user_id = NEW.user_id AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PASO 3: Crear el trigger que usará la función anterior
-- Se activa antes de insertar o actualizar un registro en la tabla `contratos`.
DROP TRIGGER IF EXISTS trigger_ensure_single_active_contract ON public.contratos;
CREATE TRIGGER trigger_ensure_single_active_contract
BEFORE INSERT OR UPDATE ON public.contratos
FOR EACH ROW
EXECUTE FUNCTION public.ensure_single_active_contract();


-- PASO 4: Crear una VISTA (`VIEW`) con la lógica del semáforo de vencimiento
-- Esta vista simplifica las consultas desde el frontend.
CREATE OR REPLACE VIEW public.contratos_con_semaforo AS
SELECT
    id,
    user_id,
    puesto,
    fecha_inicio,
    fecha_fin,
    tipo_contrato,
    es_activo,
    CASE
        WHEN es_activo = false THEN 'Inactivo'
        WHEN fecha_fin IS NULL THEN 'Vigente'
        WHEN fecha_fin <= now() THEN 'Vencido'
        WHEN fecha_fin > now() AND fecha_fin <= (now() + INTERVAL '2 month') THEN 'Por Vencer' -- CORRECCIÓN: Texto acortado
        ELSE 'Vigente'
    END::character varying AS estado_semaforo
FROM
    public.contratos;

-- PASO 5: Crear las Políticas de Seguridad para la tabla `contratos`
-- Primero, se borran políticas existentes para evitar conflictos.
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio contrato activo" ON public.contratos;
DROP POLICY IF EXISTS "Admin y RRHH tienen acceso total a los contratos" ON public.contratos;

-- Política 1: Permitir a los usuarios ver su propio contrato activo.
CREATE POLICY "Los usuarios pueden ver su propio contrato activo"
ON public.contratos FOR SELECT
USING (user_id = auth.uid() AND es_activo = true);

-- Política 2: Permitir a los administradores y a RRHH gestionar todos los contratos.
CREATE POLICY "Admin y RRHH tienen acceso total a los contratos"
ON public.contratos FOR ALL
USING (
    (public.get_user_role(auth.uid()) = 'Admin') OR
    (public.get_user_role(auth.uid()) = 'RRHH')
)
WITH CHECK (
    (public.get_user_role(auth.uid()) = 'Admin') OR
    (public.get_user_role(auth.uid()) = 'RRHH')
);

-- PASO 6: Habilitar Row Level Security (RLS) en la tabla.
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos_con_semaforo ENABLE ROW LEVEL SECURITY;

-- Aplicar la misma política de RRHH y Admin a la VISTA para que puedan ver todo.
DROP POLICY IF EXISTS "Admin y RRHH tienen acceso total a la vista de contratos" ON public.contratos_con_semaforo;
CREATE POLICY "Admin y RRHH tienen acceso total a la vista de contratos"
ON public.contratos_con_semaforo FOR SELECT
USING (
    (public.get_user_role(auth.uid()) = 'Admin') OR
    (public.get_user_role(auth.uid()) = 'RRHH')
);
