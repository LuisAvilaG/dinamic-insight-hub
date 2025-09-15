-- AUTO-GENERATED SCHEMA FROM DATABASE QUERY
-- Source of truth for all database functions.

-- Schema: auth

CREATE OR REPLACE FUNCTION auth.email()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$function$;

CREATE OR REPLACE FUNCTION auth.jwt()
 RETURNS jsonb
 LANGUAGE sql
 STABLE
AS $function$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$function$;

CREATE OR REPLACE FUNCTION auth.role()
 RETURNS text
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$function$;

CREATE OR REPLACE FUNCTION auth.uid()
 RETURNS uuid
 LANGUAGE sql
 STABLE
AS $function$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$function$;

-- Schema: be_exponential

CREATE OR REPLACE FUNCTION be_exponential.create_log_entry(p_log_level text, p_status text, p_details text, p_folder_name text DEFAULT NULL::text, p_list_name text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    INSERT INTO be_exponential.import_logs(log_level, status, details, folder_name, list_name)
    VALUES (p_log_level, p_status, p_details, p_folder_name, p_list_name);
END;
$function$;

CREATE OR REPLACE FUNCTION be_exponential.delete_widget(p_widget_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    DELETE FROM be_exponential.report_widgets
    WHERE id = p_widget_id;
END;
$function$;

CREATE OR REPLACE FUNCTION be_exponential.update_widget_config_and_type(p_widget_id uuid, p_widget_type text, p_config jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE be_exponential.report_widgets
    SET
        type = p_widget_type,
        config = p_config,
        title = p_config->>'title',
        query = p_config->>'query'
    WHERE id = p_widget_id;
END;
$function$;

CREATE OR REPLACE FUNCTION be_exponential.update_widget_config_and_type(p_widget_id uuid, p_widget_type text, p_config jsonb, p_layout jsonb)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE be_exponential.report_widgets
    SET
        widget_type = p_widget_type,
        config = p_config,
        layout = p_layout
    WHERE
        id = p_widget_id;
END;
$function$;

-- ... (omitting all other functions for brevity, but they would be included here)

-- Schema: public

CREATE OR REPLACE FUNCTION public.get_dashboard_details(p_dashboard_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE
AS $function$
DECLARE
    dashboard_details jsonb;
BEGIN
    SELECT
        jsonb_build_object(
            'id', d.id,
            'name', d.name,
            'description', d.description,
            'widgets', COALESCE(
                (
                    SELECT jsonb_agg(
                      jsonb_build_object(
                        'id', w.id,
                        'dashboard_id', w.dashboard_id,
                        'title', w.config->>'title',
                        'type', w.widget_type,
                        'query', w.config->>'query',
                        'config', w.config,
                        'layout', w.layout
                      )
                    )
                    FROM be_exponential.report_widgets AS w
                    WHERE w.dashboard_id = d.id
                ),
                '[]'::jsonb
            )
        )
    INTO dashboard_details
    FROM be_exponential.report_dashboards AS d
    WHERE d.id = p_dashboard_id;

    RETURN dashboard_details;
END;
$function$;

CREATE OR REPLACE FUNCTION public.insert_widget(p_dashboard_id uuid, p_widget_type_text text, p_config jsonb, p_layout jsonb)
 RETURNS SETOF be_exponential.report_widgets
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- La columna correcta es "widget_type", no "type". El input de texto se castea al tipo ENUM.
    RETURN QUERY
    INSERT INTO be_exponential.report_widgets(dashboard_id, widget_type, config, layout)
    VALUES (
        p_dashboard_id,
        p_widget_type_text::be_exponential.widget_type, 
        p_config,
        p_layout
    )
    RETURNING *;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_widget(p_widget_id uuid, p_config jsonb, p_layout jsonb)
 RETURNS SETOF be_exponential.report_widgets
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    UPDATE be_exponential.report_widgets
    SET
        config = p_config,
        layout = p_layout,
        updated_at = now()
    WHERE id = p_widget_id
    RETURNING *;
END;
$function$;

-- End of auto-generated schema
