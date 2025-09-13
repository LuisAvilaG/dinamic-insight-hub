
-- Creamos un tipo de dato personalizado que coincida con la estructura de las tareas que recibimos.
-- Esto hace que la función sea más segura y fácil de usar.
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
    custom_hrs_estimadas NUMERIC
);

-- Creamos la función RPC que se encargará de hacer el "upsert".
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_from_clickup(tasks_data be_exponential.clickup_task_import_type[])
RETURNS void
LANGUAGE plpgsql
-- La marcamos como SECURITY DEFINER para que se ejecute con los permisos del creador (el rol de servicio)
-- y pueda escribir en la tabla `be_exponential.tasks`.
SECURITY DEFINER
AS $$
BEGIN
    -- Usamos un bucle para recorrer cada tarea en el array de entrada y hacer el upsert.
    FOR i IN 1..array_length(tasks_data, 1) LOOP
        INSERT INTO be_exponential.tasks (
            clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, name,
            status, priority, start_date, due_date, time_tracked_ms, is_subtask,
            parent_task_id, last_synced_at, custom_hrs_estimadas
        )
        VALUES (
            (tasks_data[i]).clickup_task_id, (tasks_data[i]).clickup_list_id, (tasks_data[i]).clickup_folder_id,
            (tasks_data[i]).clickup_space_id, (tasks_data[i]).name, (tasks_data[i]).status, (tasks_data[i]).priority,
            (tasks_data[i]).start_date, (tasks_data[i]).due_date, (tasks_data[i]).time_tracked_ms,
            (tasks_data[i]).is_subtask, (tasks_data[i]).parent_task_id, (tasks_data[i]).last_synced_at,
            (tasks_data[i]).custom_hrs_estimadas
        )
        ON CONFLICT (clickup_task_id) DO UPDATE SET
            clickup_list_id = EXCLUDED.clickup_list_id,
            clickup_folder_id = EXCLUDED.clickup_folder_id,
            clickup_space_id = EXCLUDED.clickup_space_id,
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            priority = EXCLUDED.priority,
            start_date = EXCLUDED.start_date,
            due_date = EXCLUDED.due_date,
            time_tracked_ms = EXCLUDED.time_tracked_ms,
            is_subtask = EXCLUDED.is_subtask,
            parent_task_id = EXCLUDED.parent_task_id,
            last_synced_at = EXCLUDED.last_synced_at,
            custom_hrs_estimadas = EXCLUDED.custom_hrs_estimadas;
    END LOOP;
END;
$$;

-- Otorgamos permisos explícitos al rol `service_role` para ejecutar esta función.
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_from_clickup(be_exponential.clickup_task_import_type[]) TO service_role;
