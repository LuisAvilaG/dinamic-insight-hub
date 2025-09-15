# Repositorio Central de Funciones de Supabase

Este documento sirve como la única fuente de verdad para las definiciones de las funciones de PostgreSQL (RPCs) utilizadas en este proyecto. Cualquier modificación a una función en el dashboard de Supabase DEBE ser reflejada aquí.

---

## Core Dashboard & Widget Functions

### `public.get_dashboards()`

Obtiene una lista de todos los dashboards disponibles.

```sql
CREATE OR REPLACE FUNCTION public.get_dashboards()
 RETURNS SETOF be_exponential.report_dashboards
 LANGUAGE sql
 STABLE
AS $function$
  SELECT * FROM be_exponential.report_dashboards ORDER BY created_at DESC;
$function$
```

---

### `public.create_dashboard()`

Crea un nuevo dashboard.

```sql
CREATE OR REPLACE FUNCTION public.create_dashboard(p_name text, p_description text, p_department text)
 RETURNS be_exponential.report_dashboards
 LANGUAGE sql
AS $function$
  INSERT INTO be_exponential.report_dashboards(name, description, department)
  VALUES (p_name, p_description, p_department)
  RETURNING *;
$function$
```

---

### `public.get_dashboard_details()`

Obtiene los detalles de un dashboard específico, incluyendo todos sus widgets anidados con su configuración completa.

```sql
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
            'department', d.department,
            'widgets', COALESCE((
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'id', w.id,
                        'widget_type', w.widget_type,
                        'layout', w.layout,
                        'config', w.config
                    )
                )
                FROM be_exponential.report_widgets AS w
                WHERE w.dashboard_id = p_dashboard_id
            ), '[]'::jsonb)
        )
    INTO dashboard_details
    FROM be_exponential.report_dashboards AS d
    WHERE d.id = p_dashboard_id;

    RETURN dashboard_details;
END;
$function$
```

---

### `public.create_widget()` (Corregida)

Crea un nuevo widget, asegurando que el `widget_type` (texto) se convierta (castee) al tipo ENUM `be_exponential.widget_type` esperado por la tabla.

```sql
CREATE OR REPLACE FUNCTION public.create_widget(
    p_dashboard_id uuid,
    p_widget_type text,
    p_config jsonb,
    p_layout jsonb
)
RETURNS SETOF be_exponential.report_widgets
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  INSERT INTO be_exponential.report_widgets(dashboard_id, widget_type, config, layout)
  VALUES (
    p_dashboard_id,
    p_widget_type::be_exponential.widget_type, -- Cassteo a ENUM
    p_config,
    p_layout
  )
  RETURNING *;
END;
$$;
```

---

### `public.delete_widget()`

Elimina un widget específico.

```sql
CREATE OR REPLACE FUNCTION public.delete_widget(p_widget_id uuid)
  RETURNS void
  LANGUAGE sql
  AS $$
    DELETE FROM be_exponential.report_widgets WHERE id = p_widget_id;
$$;
```

---

### `public.update_widget_layout()`

Actualiza la posición (x, y) y el tamaño (w, h) de un widget específico.

```sql
CREATE OR REPLACE FUNCTION public.update_widget_layout(p_widget_id uuid, p_layout jsonb)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE be_exponential.report_widgets
  SET layout = p_layout
  WHERE id = p_widget_id;
END;
$$;
```

---

### `public.update_widget_config()` (Corregida)

Actualiza el tipo y la configuración de un widget existente. También realiza el casteo del `widget_type` de texto a ENUM.

```sql
CREATE OR REPLACE FUNCTION public.update_widget_config(
    p_widget_id uuid,
    p_widget_type text,
    p_config jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE be_exponential.report_widgets
  SET
    widget_type = p_widget_type::be_exponential.widget_type, -- Cassteo a ENUM
    config = p_config
  WHERE id = p_widget_id;
END;
$$;
```

---

## Helper & Utility Functions

### `public.execute_query()`

Ejecuta de forma segura una consulta SQL de solo lectura (SELECT) proporcionada como texto.

```sql
CREATE OR REPLACE FUNCTION public.execute_query(p_query text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $function$
BEGIN
  IF lower(p_query) NOT LIKE 'select %' THEN
    RAISE EXCEPTION 'Solo se permiten consultas SELECT.';
  END IF;
  
  RETURN (SELECT jsonb_agg(t) FROM (EXECUTE p_query) t);
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error ejecutando la consulta: %', SQLERRM;
END;
$function$
```

---

### `public.get_schema_tables()` (Modificada)

Devuelve una lista de tablas con sus esquemas de los esquemas 'public' y 'be_exponential'. Ya no necesita parámetros.

```sql
CREATE OR REPLACE FUNCTION public.get_schema_tables()
RETURNS TABLE(table_schema text, table_name text)
LANGUAGE sql
STABLE
AS $$
  SELECT t.table_schema::text, t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema IN ('public', 'be_exponential')
    AND t.table_type = 'BASE TABLE'
  ORDER BY t.table_schema, t.table_name;
$$;
```

---

### `public.get_table_columns()` (Modificada)

Devuelve las columnas y sus tipos de dato para una tabla específica en un esquema específico. Requiere tanto el nombre del esquema como el de la tabla.

```sql
CREATE OR REPLACE FUNCTION public.get_table_columns(p_schema_name text, p_table_name text)
RETURNS TABLE(column_name text, data_type text)
LANGUAGE sql
STABLE
AS $$
  SELECT c.column_name::text, c.data_type::text
  FROM information_schema.columns c
  WHERE c.table_schema = p_schema_name
    AND c.table_name = p_table_name
  ORDER BY c.ordinal_position;
$$;
```
