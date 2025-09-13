
-- ==================================================================
-- MIGRACIÓN: Sincronizar el último acceso de los usuarios (CORREGIDO CON COMILLAS DOBLES)
-- ==================================================================
-- Hecho: Se ha corregido la referencia a la tabla Cuentas envolviéndola en comillas dobles
-- para que coincida con la definición exacta de la base de datos que distingue mayúsculas y minúsculas.
-- ==================================================================

-- PASO 1: Añadir la columna a la tabla pública "Cuentas"
ALTER TABLE public."Cuentas"
ADD COLUMN ultimo_acceso TIMESTAMPTZ;

-- PASO 2: Crear la función de sincronización
CREATE OR REPLACE FUNCTION public.sync_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."Cuentas"
  SET ultimo_acceso = NEW.last_sign_in_at
  WHERE user_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASO 3: Crear el trigger en la tabla `auth.users`
CREATE TRIGGER on_user_updated
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.sync_last_sign_in();
