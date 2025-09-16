-- ==================================================================
-- MIGRACIÓN PARA AÑADIR ROL DE EMPRESA PERSONALIZADO
-- ==================================================================

-- Añade la nueva columna 'RolEmpresa' a la tabla 'Cuentas'.
-- Será de tipo TEXT y puede ser nula por defecto.
ALTER TABLE public."Cuentas"
ADD COLUMN "RolEmpresa" TEXT;
