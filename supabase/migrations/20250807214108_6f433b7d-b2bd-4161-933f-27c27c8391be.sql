-- Crear tabla para gestionar reportes de Looker Studio
CREATE TABLE public.reportes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  departamento TEXT NOT NULL CHECK (departamento IN ('Financiero', 'Operativo', 'Directivo', 'Consultoría', 'Dinamic')),
  descripcion TEXT,
  iframe_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir acceso completo a usuarios autenticados
CREATE POLICY "Usuarios pueden ver todos los reportes" 
ON public.reportes 
FOR SELECT 
USING (true);

CREATE POLICY "Usuarios pueden crear reportes" 
ON public.reportes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar reportes" 
ON public.reportes 
FOR UPDATE 
USING (true);

CREATE POLICY "Usuarios pueden eliminar reportes" 
ON public.reportes 
FOR DELETE 
USING (true);

-- Crear función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualización automática de timestamps
CREATE TRIGGER update_reportes_updated_at
BEFORE UPDATE ON public.reportes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();