-- supabase/migrations/20251010120000_sync_profile_to_auth_users.sql

-- =====================================================================================
--  OBJETIVO: Sincronizar datos del perfil desde "Cuentas" a "auth.users"
-- =====================================================================================
--
--  PROBLEMA:
--  La información del perfil (Rol, Nombre) solo existe en la tabla "Cuentas".
--  Esto obliga al frontend a realizar una consulta a la base de datos al iniciar sesión,
--  la cual falla debido a políticas RLS complejas, causando que la app no cargue.
--
--  SOLUCIÓN:
--  Se crea una función y un trigger que copian automáticamente los datos del perfil
--  (Nombre, Rol, avatar_url) desde "Cuentas" al campo `raw_user_meta_data` de la
--  tabla `auth.users` cada vez que se inserta o actualiza un perfil.
--
--  Esto asegura que la información del perfil esté siempre disponible en el JWT y
--  en la sesión del usuario, eliminando la necesidad de la consulta a la base de datos
--  y solucionando el problema de raíz.
--
-- =====================================================================================

-- 1. Crear la función que se ejecutará con el trigger
CREATE OR REPLACE FUNCTION public.sync_user_metadata_from_cuentas()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET
    raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{Rol}', to_jsonb(NEW."Rol")
    ) || jsonb_build_object(
        'Nombre', NEW."Nombre",
        'avatar_url', NEW.avatar_url
    )
  WHERE
    id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Crear el trigger que se activa al insertar o actualizar en "Cuentas"
CREATE TRIGGER on_cuentas_change_sync_metadata
AFTER INSERT OR UPDATE OF "Rol", "Nombre", "avatar_url" ON public."Cuentas"
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_metadata_from_cuentas();
