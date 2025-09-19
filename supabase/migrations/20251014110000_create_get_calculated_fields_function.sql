-- =====================================================================================
-- MIGRACIÓN: Crear la función get_calculated_fields
-- FECHA: 2025-10-14
-- AUTOR: AI Assistant
-- PROPÓSITO: Crear una función RPC segura para obtener los campos calculados
--            que pertenecen al usuario autenticado. La función internamente consulta
--            el esquema `be_exponential`, pero al vivir en `public`, simplifica
--            el código del frontend y respeta la abstracción del esquema.
-- =====================================================================================

CREATE OR REPLACE FUNCTION public.get_calculated_fields()
RETURNS TABLE(
    id UUID,
    name TEXT,
    expression TEXT,
    tables_used TEXT[],
    user_id UUID,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
)
STABLE
LANGUAGE plpgsql
AS $$
BEGIN
    -- Utilizar la seguridad a nivel de fila (RLS) implícita de Supabase.
    -- La política que creamos en la migración anterior asegurará que esta consulta
    -- solo devuelva las filas donde auth.uid() = user_id.
    RETURN QUERY
    SELECT
        f.id,
        f.name,
        f.expression,
        f.tables_used,
        f.user_id,
        f.created_at,
        f.updated_at
    FROM
        be_exponential.calculated_fields f
    WHERE
        f.user_id = auth.uid();
END;
$$;
