-- Add columns to Cuentas for user management UI
ALTER TABLE public."Cuentas"
  ADD COLUMN IF NOT EXISTS "Nombre" text,
  ADD COLUMN IF NOT EXISTS "Estado" text NOT NULL DEFAULT 'activo',
  ADD COLUMN IF NOT EXISTS "UltimoAcceso" timestamp with time zone,
  ADD COLUMN IF NOT EXISTS created_at timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Create trigger to auto-update updated_at on changes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_cuentas_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_cuentas_updated_at
    BEFORE UPDATE ON public."Cuentas"
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Optional: ensure basic index for email lookup performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_cuentas_correo' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_cuentas_correo ON public."Cuentas" ("Correo");
  END IF;
END$$;