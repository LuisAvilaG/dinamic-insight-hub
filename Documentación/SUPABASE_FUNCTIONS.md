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

---

## Notification & Automation Functions

### `public.handle_new_announcement()`

**Trigger Function.** Se activa cuando se inserta una nueva fila en `public.announcements`. Su propósito es crear una notificación de tipo 'Anuncio' para cada usuario registrado en el sistema.

- **Trigger:** `on_new_announcement` AFTER INSERT ON `public.announcements`
- **Lógica:** Inserta una fila en `public.notifications` por cada usuario en `public."Cuentas"`.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_announcement()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.notifications (user_id, message, type, link)
    SELECT
        id,
        'Se ha publicado un nuevo anuncio: "' || NEW.title || '"',
        'Anuncio',
        '/dashboard'
    FROM public."Cuentas";
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### `public.handle_new_leave_request()`

**Trigger Function.** Se activa cuando se inserta una nueva solicitud en `public.vacaciones_solicitudes` o `public.permisos_solicitudes`. Su objetivo es notificar a todos los aprobadores designados de un empleado que tienen una nueva solicitud pendiente.

- **Triggers:**
    - `on_new_vacation_request` AFTER INSERT ON `public.vacaciones_solicitudes`
    - `on_new_permission_request` AFTER INSERT ON `public.permisos_solicitudes`
- **Lógica:** Busca en `public.vacaciones_aprobadores` quiénes son los líderes del solicitante y crea una notificación de tipo 'Solicitud' para cada uno de ellos.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_leave_request()
RETURNS TRIGGER AS $$
DECLARE
    solicitante_nombre TEXT;
    tipo_solicitud TEXT;
BEGIN
    SELECT "Nombre" INTO solicitante_nombre FROM public."Cuentas" WHERE user_id = NEW.solicitante_user_id;

    IF TG_TABLE_NAME = 'vacaciones_solicitudes' THEN
        tipo_solicitud := 'vacaciones';
    ELSE
        tipo_solicitud := 'permiso';
    END IF;

    INSERT INTO public.notifications (user_id, message, type, link)
    SELECT
        aprobador_user_id,
        solicitante_nombre || ' ha enviado una nueva solicitud de ' || tipo_solicitud,
        'Solicitud',
        '/recursos-humanos?tab=mi-equipo'
    FROM public.vacaciones_aprobadores
    WHERE empleado_user_id = NEW.solicitante_user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

### `public.handle_leave_request_update()`

**Trigger Function.** Se activa cuando se actualiza una solicitud en `public.vacaciones_solicitudes` o `public.permisos_solicitudes`. Su propósito es notificar al empleado que el estado de su solicitud ha cambiado (ej. a 'aprobado').

- **Triggers:**
    - `on_vacation_request_update` AFTER UPDATE ON `public.vacaciones_solicitudes`
    - `on_permission_request_update` AFTER UPDATE ON `public.permisos_solicitudes`
- **Lógica:** Compara el estado `OLD.estado` con `NEW.estado`. Si son diferentes, crea una notificación de tipo 'Solicitud' para el empleado que originó la solicitud.

```sql
CREATE OR REPLACE FUNCTION public.handle_leave_request_update()
RETURNS TRIGGER AS $$
DECLARE
    tipo_solicitud TEXT;
    mensaje TEXT;
BEGIN
    IF OLD.estado <> NEW.estado THEN
        IF TG_TABLE_NAME = 'vacaciones_solicitudes' THEN
            tipo_solicitud := 'vacaciones';
        ELSE
            tipo_solicitud := 'permiso';
        END IF;

        IF NEW.estado = 'aprobado' THEN
            mensaje := '¡Buenas noticias! Tu solicitud de ' || tipo_solicitud || ' ha sido aprobada.';
        ELSE
            mensaje := 'Tu solicitud de ' || tipo_solicitud || ' ha sido actualizada.';
        END IF;

        INSERT INTO public.notifications (user_id, message, type, link)
        VALUES (
            NEW.solicitante_user_id,
            mensaje,
            'Solicitud',
            '/recursos-humanos'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
