-- Enable RLS on Cuentas table
ALTER TABLE public."Cuentas" ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to view all accounts
CREATE POLICY "Authenticated users can view all accounts"
ON public."Cuentas"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert new accounts
CREATE POLICY "Authenticated users can insert new accounts"
ON public."Cuentas"
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update accounts
CREATE POLICY "Authenticated users can update accounts"
ON public."Cuentas"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete accounts
CREATE POLICY "Authenticated users can delete accounts"
ON public."Cuentas"
FOR DELETE
USING (auth.role() = 'authenticated');
