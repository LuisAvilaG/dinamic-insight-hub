-- Add avatar and department fields to Cuentas table for profile settings
ALTER TABLE public."Cuentas"
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS departamento TEXT;

-- Optional: make Correo unique to identify users reliably (only if not already unique)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'cuentas_correo_unique'
  ) THEN
    CREATE UNIQUE INDEX cuentas_correo_unique ON public."Cuentas" ("Correo");
  END IF;
END $$;
