-- Final attempt to resolve the column write issue by recreating the column.

-- Step 1: Rename the existing, problematic column to isolate it.
ALTER TABLE public.reportes RENAME COLUMN frecuencia_actualizacion TO update_frequency_old;

-- Step 2: Create a new column with the correct name.
-- The RLS policies already in place will apply to this new column automatically.
ALTER TABLE public.reportes ADD COLUMN frecuencia_actualizacion TEXT;
