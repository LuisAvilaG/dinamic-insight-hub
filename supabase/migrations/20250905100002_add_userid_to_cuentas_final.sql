
-- ========== PASO 1: AÑADIR LA COLUMNA user_id A LA TABLA "Cuentas" ==========
-- Se añade como nullable para evitar errores en las filas que ya existen.
-- Se utiliza el nombre entre comillas dobles para respetar las mayúsculas.
ALTER TABLE public."Cuentas"
ADD COLUMN user_id UUID;

-- ========== PASO 2: VINCULAR LA NUEVA COLUMNA CON LA TABLA DE USUARIOS DE AUTH ==========
-- Se crea una relación (Foreign Key) para asegurar la integridad de los datos.
ALTER TABLE public."Cuentas"
ADD CONSTRAINT fk_auth_users_id
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE SET NULL;

-- ========== PASO 3: POBLAR LA COLUMNA user_id PARA USUARIOS EXISTENTES ==========
-- Se actualizan las filas existentes en la tabla "Cuentas" para rellenar la nueva columna user_id.
-- Se usa el email como punto de conexión. La columna "Correo" también debe ir entre comillas.
UPDATE public."Cuentas" c
SET user_id = u.id
FROM auth.users u
WHERE c."Correo" = u.email;

-- ========== NOTA DE SEGURIDAD Y FUTUROS PASOS ==========
-- Este cambio es aditivo y no debería romper ninguna funcionalidad existente del módulo de usuarios.
-- A futuro, es recomendable que al crear un nuevo registro en la tabla 'Cuentas',
-- también se popule el campo 'user_id' para mantener la consistencia de los datos.
