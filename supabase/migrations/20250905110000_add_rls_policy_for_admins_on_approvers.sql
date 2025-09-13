
-- ========== PASO 1: CREAR UNA FUNCIÓN AUXILIAR PARA OBTENER EL ROL DE UN USUARIO ==========
-- Esta función permite a las políticas de seguridad (RLS) comprobar el rol de un usuario
-- a partir de su ID de autenticación (auth.uid()).
-- Se usa SECURITY DEFINER para que la función tenga permiso de leer la tabla "Cuentas",
-- lo cual es una práctica estándar y segura para este tipo de funciones de ayuda.

CREATE OR REPLACE FUNCTION public.get_user_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_user_role TEXT;
BEGIN
  SELECT "Rol"
  INTO v_user_role
  FROM public."Cuentas"
  WHERE user_id = p_user_id;
  RETURN v_user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== PASO 2: AÑADIR LA POLÍTICA DE SEGURIDAD PARA ADMINISTRADORES ==========
-- Se crea una nueva política en la tabla `vacaciones_aprobadores` que da permisos totales
-- a los usuarios cuyo rol, obtenido con la función anterior, sea 'admin'.

CREATE POLICY "Los administradores pueden gestionar la jerarquía de aprobadores"
ON public.vacaciones_aprobadores
FOR ALL -- Permite SELECT, INSERT, UPDATE, y DELETE
USING (public.get_user_role(auth.uid()) = 'Admin')
WITH CHECK (public.get_user_role(auth.uid()) = 'Admin');

-- ========= NOTA FINAL ==========
-- La política existente "Usuarios pueden ver a quién aprueban y quién les aprueba" sigue activa
-- para los usuarios que no son administradores, permitiéndoles ver sus propias asignaciones.
-- Esta nueva política simplemente añade los permisos que faltaban para el rol de administrador.
