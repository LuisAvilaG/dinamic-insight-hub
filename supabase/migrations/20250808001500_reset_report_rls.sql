-- Force-reset RLS policies for the 'reportes' table

-- Step 1: Temporarily disable RLS on the table.
-- This removes all active policies and allows us to start fresh.
ALTER TABLE public.reportes DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop any leftover policies from previous attempts, just in case.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.reportes;
DROP POLICY IF EXISTS "Allow authenticated users to insert reports" ON public.reportes;
DROP POLICY IF EXISTS "Allow authenticated users to update reports" ON public.reportes;
DROP POLICY IF EXISTS "Allow authenticated users to delete reports" ON public.reportes;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.reportes;
DROP POLICY IF EXISTS "Enable insert for all authenticated users" ON public.reportes;
DROP POLICY IF EXISTS "Enable update for all authenticated users" ON public.reportes;
DROP POLICY IF EXISTS "Enable delete for all authenticated users" ON public.reportes;


-- Step 3: Re-enable RLS. At this point, no one can access the table.
ALTER TABLE public.reportes ENABLE ROW LEVEL SECURITY;

-- Step 4: Create a single, comprehensive policy for all actions.
-- This policy allows any authenticated user to perform any action (SELECT, INSERT, UPDATE, DELETE).
-- This is permissive but ensures functionality.
CREATE POLICY "Allow full access for authenticated users"
ON public.reportes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);