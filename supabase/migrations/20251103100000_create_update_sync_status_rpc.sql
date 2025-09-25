-- supabase/migrations/20251103100000_create_update_sync_status_rpc.sql

-- Creamos una función en el esquema público para que sea fácilmente accesible desde el cliente.
-- La función actualiza el estado 'is_active' de una sincronización en la tabla 'clickup.sync_configs'.
-- Se utiliza SECURITY DEFINER para que la función se ejecute con los permisos del creador,
-- permitiéndole modificar una tabla en otro esquema de forma segura.

CREATE OR REPLACE FUNCTION public.update_sync_config_status(
    sync_id_to_update UUID,
    new_status BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    -- Actualizamos la tabla 'sync_configs' en el esquema 'clickup'
    UPDATE clickup.sync_configs
    SET is_active = new_status
    WHERE id = sync_id_to_update;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Otorgamos permiso al rol 'authenticated' (cualquier usuario logueado)
-- para ejecutar esta función específica.
GRANT EXECUTE ON FUNCTION public.update_sync_config_status(UUID, BOOLEAN) TO authenticated;
