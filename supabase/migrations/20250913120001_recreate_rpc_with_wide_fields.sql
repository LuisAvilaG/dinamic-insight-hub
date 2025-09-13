
-- PASO 1: Eliminar la función RPC y el tipo de dato anteriores.
-- Es necesario eliminarlos para poder crearlos de nuevo con la estructura actualizada.
-- La cláusula IF EXISTS evita errores si el script se ejecuta más de una vez.
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_from_clickup(be_exponential.clickup_task_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_import_type;

-- PASO 2: Crear un nuevo tipo de dato que refleje la nueva estructura de la tabla.
-- Este tipo de dato incluirá todos los nuevos campos que hemos añadido.
CREATE TYPE be_exponential.clickup_task_import_type AS (
    clickup_task_id TEXT,
    clickup_list_id TEXT,
    clickup_folder_id TEXT,
    clickup_space_id TEXT,
    name TEXT,
    status TEXT,
    priority TEXT,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    time_tracked_ms BIGINT,
    is_subtask BOOLEAN,
    parent_task_id TEXT,
    last_synced_at TIMESTAMPTZ,
    space_name TEXT,
    folder_name TEXT,
    list_name TEXT,
    
    -- Campos personalizados
    custom_fecha_planeada_go_live TIMESTAMPTZ,
    custom_fecha_inicio TIMESTAMPTZ,
    custom_fecha_limite_linea_base TIMESTAMPTZ,
    custom_horas_totales NUMERIC,
    custom_hrs_estimadas NUMERIC,
    custom_dias_num NUMERIC,
    custom_total_dias_num NUMERIC,
    custom_prioridad_cliente NUMERIC,
    custom_estado_proyecto TEXT,
    custom_escalar_al BOOLEAN,
    custom_porcentaje_completado TEXT,
    custom_horas_proyecto NUMERIC,
    custom_plan_de_accion TEXT,
    custom_tipo_asignacion TEXT,
    custom_nombre_cliente_be_exp TEXT,
    custom_facturable_dinamic_2 BOOLEAN,
    custom_sprint TEXT,
    custom_nombre_desarrollo TEXT,
    custom_tag_pais TEXT,
    custom_fecha_limite TIMESTAMPTZ,
    custom_duracion_estimada NUMERIC,
    custom_sprints TEXT,
    custom_estimacion NUMERIC,
    custom_probabilidad_cierre NUMERIC,
    custom_consumidas_sem39 NUMERIC,
    custom_prioridad NUMERIC
);

-- PASO 3: Recrear la función RPC con la lógica de upsert actualizada.
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_from_clickup(tasks_data be_exponential.clickup_task_import_type[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    FOR i IN 1..array_length(tasks_data, 1) LOOP
        INSERT INTO be_exponential.tasks (
            clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, name, status, priority, 
            start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, 
            space_name, folder_name, list_name,
            -- Campos personalizados
            custom_fecha_planeada_go_live, custom_fecha_inicio, custom_fecha_limite_linea_base, custom_horas_totales, 
            custom_hrs_estimadas, custom_dias_num, custom_total_dias_num, custom_prioridad_cliente, custom_estado_proyecto, 
            custom_escalar_al, custom_porcentaje_completado, custom_horas_proyecto, custom_plan_de_accion, custom_tipo_asignacion, 
            custom_nombre_cliente_be_exp, custom_facturable_dinamic_2, custom_sprint, custom_nombre_desarrollo, custom_tag_pais, 
            custom_fecha_limite, custom_duracion_estimada, custom_sprints, custom_estimacion, custom_probabilidad_cierre, 
            custom_consumidas_sem39, custom_prioridad
        )
        VALUES (
            (tasks_data[i]).clickup_task_id, (tasks_data[i]).clickup_list_id, (tasks_data[i]).clickup_folder_id, (tasks_data[i]).clickup_space_id,
            (tasks_data[i]).name, (tasks_data[i]).status, (tasks_data[i]).priority, (tasks_data[i]).start_date, (tasks_data[i]).due_date, 
            (tasks_data[i]).time_tracked_ms, (tasks_data[i]).is_subtask, (tasks_data[i]).parent_task_id, (tasks_data[i]).last_synced_at, 
            (tasks_data[i]).space_name, (tasks_data[i]).folder_name, (tasks_data[i]).list_name,
            -- Campos personalizados
            (tasks_data[i]).custom_fecha_planeada_go_live, (tasks_data[i]).custom_fecha_inicio, (tasks_data[i]).custom_fecha_limite_linea_base, 
            (tasks_data[i]).custom_horas_totales, (tasks_data[i]).custom_hrs_estimadas, (tasks_data[i]).custom_dias_num, 
            (tasks_data[i]).custom_total_dias_num, (tasks_data[i]).custom_prioridad_cliente, (tasks_data[i]).custom_estado_proyecto, 
            (tasks_data[i]).custom_escalar_al, (tasks_data[i]).custom_porcentaje_completado, (tasks_data[i]).custom_horas_proyecto, 
            (tasks_data[i]).custom_plan_de_accion, (tasks_data[i]).custom_tipo_asignacion, (tasks_data[i]).custom_nombre_cliente_be_exp, 
            (tasks_data[i]).custom_facturable_dinamic_2, (tasks_data[i]).custom_sprint, (tasks_data[i]).custom_nombre_desarrollo, 
            (tasks_data[i]).custom_tag_pais, (tasks_data[i]).custom_fecha_limite, (tasks_data[i]).custom_duracion_estimada, 
            (tasks_data[i]).custom_sprints, (tasks_data[i]).custom_estimacion, (tasks_data[i]).custom_probabilidad_cierre, 
            (tasks_data[i]).custom_consumidas_sem39, (tasks_data[i]).custom_prioridad
        )
        ON CONFLICT (clickup_task_id) DO UPDATE SET
            clickup_list_id = EXCLUDED.clickup_list_id, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name,
            name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date,
            time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id,
            last_synced_at = EXCLUDED.last_synced_at,
            -- Campos personalizados
            custom_fecha_planeada_go_live = EXCLUDED.custom_fecha_planeada_go_live, custom_fecha_inicio = EXCLUDED.custom_fecha_inicio, 
            custom_fecha_limite_linea_base = EXCLUDED.custom_fecha_limite_linea_base, custom_horas_totales = EXCLUDED.custom_horas_totales, 
            custom_hrs_estimadas = EXCLUDED.custom_hrs_estimadas, custom_dias_num = EXCLUDED.custom_dias_num, 
            custom_total_dias_num = EXCLUDED.custom_total_dias_num, custom_prioridad_cliente = EXCLUDED.custom_prioridad_cliente, 
            custom_estado_proyecto = EXCLUDED.custom_estado_proyecto, custom_escalar_al = EXCLUDED.custom_escalar_al, 
            custom_porcentaje_completado = EXCLUDED.custom_porcentaje_completado, custom_horas_proyecto = EXCLUDED.custom_horas_proyecto, 
            custom_plan_de_accion = EXCLUDED.custom_plan_de_accion, custom_tipo_asignacion = EXCLUDED.custom_tipo_asignacion, 
            custom_nombre_cliente_be_exp = EXCLUDED.custom_nombre_cliente_be_exp, custom_facturable_dinamic_2 = EXCLUDED.custom_facturable_dinamic_2, 
            custom_sprint = EXCLUDED.custom_sprint, custom_nombre_desarrollo = EXCLUDED.custom_nombre_desarrollo, 
            custom_tag_pais = EXCLUDED.custom_tag_pais, custom_fecha_limite = EXCLUDED.custom_fecha_limite, 
            custom_duracion_estimada = EXCLUDED.custom_duracion_estimada, custom_sprints = EXCLUDED.custom_sprints, 
            custom_estimacion = EXCLUDED.custom_estimacion, custom_probabilidad_cierre = EXCLUDED.custom_probabilidad_cierre, 
            custom_consumidas_sem39 = EXCLUDED.custom_consumidas_sem39, custom_prioridad = EXCLUDED.custom_prioridad;
    END LOOP;
END;
$$;

-- PASO 4: Volver a otorgar permisos de ejecución al rol de servicio.
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_from_clickup(be_exponential.clickup_task_import_type[]) TO service_role;
