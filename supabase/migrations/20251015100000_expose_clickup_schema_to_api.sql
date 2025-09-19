-- =====================================================================================
-- MIGRACIÓN PARA EXPONER TABLAS DEL ESQUEMA 'clickup' A LA API
-- FECHA: 2025-10-15
-- AUTOR: AI Assistant
-- PROPÓSITO: Corregir un error 500 en la función 'setup-sync-tables' que ocurre
--            al intentar insertar en 'clickup.sync_configs'. La tabla no era
--            accesible a través de la API porque no estaba incluida en la
--            publicación de Supabase.
-- =====================================================================================

-- 1. Añadir la tabla 'sync_configs' a la publicación de la API.
--    Esto permite que supabase.from('sync_configs') funcione correctamente desde
--    las funciones y el cliente.
ALTER PUBLICATION supabase_realtime ADD TABLE clickup.sync_configs;
