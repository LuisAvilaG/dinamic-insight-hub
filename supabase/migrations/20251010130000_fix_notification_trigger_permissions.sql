-- supabase/migrations/20251010130000_fix_notification_trigger_permissions.sql

-- =====================================================================================
--  OBJETIVO: Corregir permisos en el trigger de notificaciones para anuncios.
-- =====================================================================================
--
--  PROBLEMA:
--  La función `handle_new_announcement` se ejecuta en un contexto donde pierde la
--  sesión del usuario. Como resultado, las políticas de seguridad (RLS) le impiden
--  leer la lista completa de usuarios de la tabla "Cuentas", fallando al crear
--  las notificaciones.
--
--  SOLUCIÓN:
--  Se modifica la función para que se ejecute con `SECURITY DEFINER`. Esto le otorga
--  los permisos del dueño de la función (el superusuario), permitiéndole bypassar
--  las políticas RLS y leer la lista de usuarios necesaria para enviar las
--  notificaciones. Esta es la práctica recomendada para este tipo de operaciones.
--
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.handle_new_announcement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notifications (user_id, message, type, link)
    SELECT user_id, 'Se ha publicado un nuevo anuncio: "' || NEW.title || '"', 'Anuncio', '/dashboard'
    FROM public."Cuentas";
    RETURN NEW;
END;
$$;
