
-- Otorgamos el permiso de "uso" sobre el esquema be_exponential al rol de servicio.
-- Esto permite que el rol de servicio pueda "ver" y "acceder" a los objetos dentro de este esquema, como nuestra función RPC.
GRANT USAGE ON SCHEMA be_exponential TO service_role;
