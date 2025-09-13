-- Creates a trigger to automatically update the updated_at timestamp on row update.

-- 1. Create a function that returns the current timestamp.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- Set the updated_at column of the new row to the current time.
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create a trigger that calls the function before any update on the reportes table.
DROP TRIGGER IF EXISTS on_reports_update ON public.reportes;
CREATE TRIGGER on_reports_update
BEFORE UPDATE ON public.reportes
FOR EACH ROW
EXECUTE PROCEDURE public.handle_updated_at();
