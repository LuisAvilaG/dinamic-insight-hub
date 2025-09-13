
-- =====================================================================================
-- MIGRACIÓN PARA AÑADIR RESTRICCIÓN DE UNICIDAD Y CLAVE EXTERNA
-- FECHA: 2025-09-06
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Añadir primero una restricción UNIQUE a la columna `user_id` en la
--            tabla `Cuentas` para garantizar que no haya duplicados. Después,
--            crear la clave externa desde `vacaciones_solicitudes` a `Cuentas`.
-- =====================================================================================

-- PASO 1: Asegurar que la columna de referencia es única.
ALTER TABLE public."Cuentas"
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

-- PASO 2: Ahora que la unicidad está garantizada, crear la relación.
ALTER TABLE public.vacaciones_solicitudes
ADD CONSTRAINT fk_solicitante_user_id
FOREIGN KEY (solicitante_user_id)
REFERENCES public."Cuentas" (user_id)
ON DELETE SET NULL;

-- =====================================================================================
