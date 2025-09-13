-- migrations/20251002120000_grant_permissions_for_auth_user.sql

-- =====================================================================================
-- MIGRACIÓN PARA OTORGAR PERMISOS AL ROL AUTHENTICATED
-- FECHA: 2025-10-02
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Otorgar los permisos necesarios para que el rol `authenticated` de Supabase
--            pueda interactuar con el esquema `be_exponential` y sus objetos. Esto es
--            necesario para que los usuarios logueados puedan ver y crear dashboards,
--            así como ejecutar los widgets.
-- =====================================================================================

-- 1. Otorgar permiso de "uso" sobre el esquema.
-- Esto permite al rol `authenticated` acceder a los objetos dentro del esquema.
GRANT USAGE ON SCHEMA be_exponential TO authenticated;

-- 2. Otorgar todos los permisos sobre todas las tablas en el esquema.
-- Esto incluye SELECT, INSERT, UPDATE, DELETE.
GRANT ALL ON ALL TABLES IN SCHEMA be_exponential TO authenticated;

-- 3. Otorgar permiso de ejecución sobre la función execute_query.
-- Esto es fundamental para que los widgets puedan obtener sus datos.
GRANT EXECUTE ON FUNCTION be_exponential.execute_query(p_query_text text) TO authenticated;
