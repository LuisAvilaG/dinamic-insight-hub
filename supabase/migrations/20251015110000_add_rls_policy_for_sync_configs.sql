-- =====================================================================================
-- MIGRACIÓN PARA AÑADIR RLS A LA TABLA DE CONFIGURACIÓN DE SINCRONIZACIÓN
-- FECHA: 2025-10-15
-- AUTOR: AI Assistant
-- PROPÓSITO: Solucionar el error 500 en 'setup-sync-tables' añadiendo una política
--            de seguridad a nivel de fila (RLS) a 'clickup.sync_configs'.
--            Esto requiere añadir una columna 'user_id' para rastrear la propiedad.
-- =====================================================================================

-- Paso 1: Añadir la columna 'user_id' a la tabla para vincularla a un usuario.
-- Se establece un valor predeterminado de 'auth.uid()' para que las inserciones
-- desde la API lo rellenen automáticamente con el ID del usuario actual.
ALTER TABLE clickup.sync_configs
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Paso 2: Habilitar la Seguridad a Nivel de Fila en la tabla.
-- Esto bloquea todo el acceso por defecto hasta que creemos políticas para permitirlo.
ALTER TABLE clickup.sync_configs ENABLE ROW LEVEL SECURITY;

-- Paso 3: Crear una política para permitir a los usuarios insertar sus propias configuraciones.
-- La condición WITH CHECK asegura que nadie pueda insertar una configuración para otro usuario.
CREATE POLICY "Allow users to insert their own sync configurations"
ON clickup.sync_configs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Paso 4: Crear una política que permita a los usuarios ver, actualizar y eliminar sus propias configuraciones.
-- La condición USING filtra las filas que pueden ser vistas/modificadas.
CREATE POLICY "Allow users to manage their own sync configurations"
ON clickup.sync_configs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
