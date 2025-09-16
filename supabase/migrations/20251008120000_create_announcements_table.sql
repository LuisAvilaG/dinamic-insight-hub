
-- Creamos la tabla para almacenar los anuncios
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activamos la seguridad a nivel de fila
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Damos permiso a todos los usuarios autenticados para que puedan LEER los anuncios
CREATE POLICY "Allow authenticated users to read announcements"
ON public.announcements
FOR SELECT
TO authenticated
USING (true);

-- Damos permiso a los administradores (o un rol específico) para que puedan CREAR, ACTUALIZAR y ELIMINAR anuncios
-- Nota: Usamos la tabla Cuentas para verificar el rol
CREATE POLICY "Allow admins to manage announcements"
ON public.announcements
FOR ALL
TO authenticated
USING (
    (SELECT "Rol" FROM public."Cuentas" WHERE user_id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT "Rol" FROM public."Cuentas" WHERE user_id = auth.uid()) = 'admin'
);
