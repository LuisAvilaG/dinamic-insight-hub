-- Drop existing RLS policies for the reportes table
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON public.reportes;
DROP POLICY IF EXISTS "Allow authenticated users to update reports" ON public.reportes;
DROP POLICY IF EXISTS "Allow authenticated users to delete reports" ON public.reportes;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reportes;

-- Recreate policies to grant access to all columns, including the new one

-- 1. Enable read access for all authenticated users
CREATE POLICY "Enable read access for authenticated users"
ON public.reportes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- 2. Enable insert for authenticated users
CREATE POLICY "Allow authenticated users to insert reports"
ON public.reportes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Enable update for authenticated users
CREATE POLICY "Allow authenticated users to update reports"
ON public.reportes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Enable delete for authenticated users
CREATE POLICY "Allow authenticated users to delete reports"
ON public.reportes
FOR DELETE
TO authenticated
USING (true);
