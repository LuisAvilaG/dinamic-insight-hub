-- 1. Drop dependent tables first to avoid foreign key constraints errors.
DROP TABLE IF EXISTS public.report_views;

-- 2. Now, drop the old 'reportes' table.
DROP TABLE IF EXISTS public.reportes;

-- 3. Create the 'report_dashboards' table in the 'be_exponential' schema.
CREATE TABLE be_exponential.report_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE be_exponential.report_dashboards IS 'Stores the master record for each report dashboard.';
COMMENT ON COLUMN be_exponential.report_dashboards.name IS 'The user-friendly name of the dashboard.';

-- 4. Define an ENUM type for the different kinds of widgets we can have.
CREATE TYPE be_exponential.widget_type AS ENUM (
    'bar_chart',
    'line_chart',
    'area_chart',
    'pie_chart',
    'donut_chart',
    'kpi',
    'table'
);

-- 5. Create the 'report_widgets' table in the 'be_exponential' schema.
CREATE TABLE be_exponential.report_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES be_exponential.report_dashboards(id) ON DELETE CASCADE,
    widget_type be_exponential.widget_type NOT NULL,
    config JSONB NOT NULL,
    layout JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments for clarity
COMMENT ON TABLE be_exponential.report_widgets IS 'Stores individual widgets that compose a dashboard.';
COMMENT ON COLUMN be_exponential.report_widgets.dashboard_id IS 'Foreign key linking the widget to its parent dashboard.';
COMMENT ON COLUMN be_exponential.report_widgets.widget_type IS 'The type of visualization for this widget (e.g., bar_chart, table).';
COMMENT ON COLUMN be_exponential.report_widgets.config IS 'A JSON object containing the specific configuration for the widget (data source, columns, aggregations, etc.).';
COMMENT ON COLUMN be_exponential.report_widgets.layout IS 'A JSON object defining the position and size of the widget within the dashboard grid.';


-- 6. Enable Row-Level Security (RLS) for the new tables.
ALTER TABLE be_exponential.report_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE be_exponential.report_widgets ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies to allow all authenticated users to view dashboards and widgets.
CREATE POLICY "Allow authenticated users to view dashboards"
ON be_exponential.report_dashboards FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to view widgets"
ON be_exponential.report_widgets FOR SELECT
TO authenticated
USING (true);

-- 8. Create RLS policies for admin users to manage dashboards and widgets.
--    Note the double quotes around "Cuentas" and "Rol" to respect case-sensitivity.
CREATE POLICY "Allow admins to manage dashboards"
ON be_exponential.report_dashboards FOR ALL
USING ( (SELECT "Rol" FROM public."Cuentas" WHERE user_id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT "Rol" FROM public."Cuentas" WHERE user_id = auth.uid()) = 'admin' );

CREATE POLICY "Allow admins to manage widgets"
ON be_exponential.report_widgets FOR ALL
USING ( (SELECT "Rol" FROM public."Cuentas" WHERE user_id = auth.uid()) = 'admin' )
WITH CHECK ( (SELECT "Rol" FROM public."Cuentas" WHERE user_id = auth.uid()) = 'admin' );

-- 9. Create a trigger to automatically update the 'updated_at' timestamp.
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  _new_record RECORD;
BEGIN
  _new_record := NEW;
  _new_record."updated_at" = NOW();
  RETURN _new_record;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_dashboards_updated_at
BEFORE UPDATE ON be_exponential.report_dashboards
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();

CREATE TRIGGER set_report_widgets_updated_at
BEFORE UPDATE ON be_exponential.report_widgets
FOR EACH ROW
EXECUTE FUNCTION public.set_current_timestamp_updated_at();
