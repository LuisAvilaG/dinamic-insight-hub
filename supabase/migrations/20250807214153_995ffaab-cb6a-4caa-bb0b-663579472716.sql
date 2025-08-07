-- Corregir función search_path para seguridad - con CASCADE
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$;

-- Recrear el trigger
CREATE TRIGGER update_reportes_updated_at
BEFORE UPDATE ON public.reportes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();