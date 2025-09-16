-- 1. Creamos un nuevo tipo ENUM para los tipos de anuncios.
CREATE TYPE public.announcement_type AS ENUM (
    'Evento',
    'Informativo',
    'Urgente'
);

-- 2. Añadimos la nueva columna 'type' a la tabla de anuncios.
--    Tendrá un valor por defecto 'Informativo'.
ALTER TABLE public.announcements
ADD COLUMN type announcement_type DEFAULT 'Informativo' NOT NULL;
