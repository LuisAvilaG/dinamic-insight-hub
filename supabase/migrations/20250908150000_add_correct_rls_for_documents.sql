-- =====================================================================================
-- MIGRACIÓN DEFINITIVA PARA LA SEGURIDAD DE DOCUMENTOS
-- FECHA: 2025-09-08
-- AUTOR: Gemini AI Assistant (Corregido)
-- PROPÓSITO: Implementar RLS en `documentos_empleados` y el Storage asociado,
--            basándose en el rol del usuario en la tabla `public.Cuentas`.
-- =====================================================================================

-- PASO 1: CREAR UNA FUNCIÓN PARA OBTENER EL ROL DE UN USUARIO DESDE LA TABLA Cuentas
-- Esta función es crucial, ya que lee el rol desde donde realmente está almacenado.
CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN (
    SELECT "Rol"
    FROM public."Cuentas"
    WHERE user_id = p_user_id
  );
END;
$$;

-- PASO 2: HABILITAR LA SEGURIDAD DE NIVEL DE FILA (RLS) EN LA TABLA
ALTER TABLE public.documentos_empleados ENABLE ROW LEVEL SECURITY;

-- PASO 3: CREAR POLÍTICAS PARA LA TABLA `documentos_empleados`

-- Primero, borramos cualquier política existente para empezar de cero.
DROP POLICY IF EXISTS "Los administradores pueden gestionar todos los documentos" ON public.documentos_empleados;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios documentos" ON public.documentos_empleados;
DROP POLICY IF EXISTS "Los usuarios pueden subir documentos para sí mismos" ON public.documentos_empleados;

-- 3.1. Política para Administradores: Pueden hacer cualquier cosa (ver, crear, editar, borrar).
CREATE POLICY "Los administradores pueden gestionar todos los documentos"
ON public.documentos_empleados
FOR ALL
USING (public.get_user_role(auth.uid()) = 'Admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'Admin');

-- 3.2. Política de lectura: Los usuarios pueden ver sus propios documentos.
CREATE POLICY "Los usuarios pueden ver sus propios documentos"
ON public.documentos_empleados
FOR SELECT
USING (auth.uid() = user_id);

-- 3.3. Política de inserción: Los usuarios pueden crear documentos para sí mismos.
CREATE POLICY "Los usuarios pueden subir documentos para sí mismos"
ON public.documentos_empleados
FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- PASO 4: CREAR POLÍTICAS PARA EL STORAGE (BUCKET `documentos_empleados`)

-- Borramos políticas anteriores si existen.
DROP POLICY IF EXISTS "Admin: Acceso total al bucket de documentos" ON storage.objects;
DROP POLICY IF EXISTS "Usuario: Subir documentos a su propia carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Usuario: Ver/descargar sus propios documentos" ON storage.objects;

-- 4.1. Política para Administradores: Acceso total al bucket `documentos_empleados`.
CREATE POLICY "Admin: Acceso total al bucket de documentos"
ON storage.objects
FOR ALL
USING (bucket_id = 'documentos_empleados' AND public.get_user_role(auth.uid()) = 'Admin')
WITH CHECK (bucket_id = 'documentos_empleados' AND public.get_user_role(auth.uid()) = 'Admin');

-- 4.2. Política de subida: Un usuario puede subir archivos si la ruta (path) empieza con su ID de usuario.
-- Ejemplo de path: `public/0d52e93-..../mi_documento.pdf`
CREATE POLICY "Usuario: Subir documentos a su propia carpeta"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'documentos_empleados' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 4.3. Política de lectura: Un usuario puede ver/descargar archivos de su propia carpeta.
CREATE POLICY "Usuario: Ver/descargar sus propios documentos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'documentos_empleados' AND auth.uid()::text = (storage.foldername(name))[1]);
