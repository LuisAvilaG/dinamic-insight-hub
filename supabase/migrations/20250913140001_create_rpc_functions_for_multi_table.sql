
-- =====================================================================================
-- MIGRACIÓN PARA CREAR FUNCIONES RPC PARA LA ARQUITECTURA MULTI-TABLA
-- FECHA: 2025-09-13
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Crear un tipo y una función de upsert para cada tabla de tareas,
--            permitiendo la ingesta de datos desde la Edge Function.
-- =====================================================================================

BEGIN;

-- --- 1. Para la tabla: tasks_project_information ---
DROP TYPE IF EXISTS be_exponential.clickup_task_project_information_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_project_information_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ, custom_fecha_planeada_go_live TIMESTAMPTZ, custom_fecha_de_kick_off TIMESTAMPTZ, custom_horas_proyecto NUMERIC, custom_horas_contratadas NUMERIC, custom_horas_integraciones_o_desarrollos NUMERIC, custom_fase_del_proyecto TEXT);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_project_information(tasks_data be_exponential.clickup_task_project_information_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_project_information(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, custom_fecha_planeada_go_live, custom_fecha_de_kick_off, custom_horas_proyecto, custom_horas_contratadas, custom_horas_integraciones_o_desarrollos, custom_fase_del_proyecto)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at, custom_fecha_planeada_go_live = EXCLUDED.custom_fecha_planeada_go_live, custom_fecha_de_kick_off = EXCLUDED.custom_fecha_de_kick_off, custom_horas_proyecto = EXCLUDED.custom_horas_proyecto, custom_horas_contratadas = EXCLUDED.custom_horas_contratadas, custom_horas_integraciones_o_desarrollos = EXCLUDED.custom_horas_integraciones_o_desarrollos, custom_fase_del_proyecto = EXCLUDED.custom_fase_del_proyecto;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_project_information(be_exponential.clickup_task_project_information_import_type[]) TO service_role;

-- --- 2. Para la tabla: tasks_action_items ---
DROP TYPE IF EXISTS be_exponential.clickup_task_action_items_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_action_items_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_action_items(tasks_data be_exponential.clickup_task_action_items_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_action_items(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_action_items(be_exponential.clickup_task_action_items_import_type[]) TO service_role;

-- --- 3. Para la tabla: tasks_gaps ---
DROP TYPE IF EXISTS be_exponential.clickup_task_gaps_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_gaps_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ, custom_detalles TEXT, custom_fecha_de_identificacion TIMESTAMPTZ, custom_hrs_estimadas NUMERIC);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_gaps(tasks_data be_exponential.clickup_task_gaps_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_gaps(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, custom_detalles, custom_fecha_de_identificacion, custom_hrs_estimadas)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at, custom_detalles = EXCLUDED.custom_detalles, custom_fecha_de_identificacion = EXCLUDED.custom_fecha_de_identificacion, custom_hrs_estimadas = EXCLUDED.custom_hrs_estimadas;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_gaps(be_exponential.clickup_task_gaps_import_type[]) TO service_role;

-- --- 4. Para la tabla: tasks_risks_issues ---
DROP TYPE IF EXISTS be_exponential.clickup_task_risks_issues_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_risks_issues_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ, custom_action_plan TEXT, custom_fecha_de_reporte TIMESTAMPTZ, custom_tipo TEXT);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_risks_issues(tasks_data be_exponential.clickup_task_risks_issues_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_risks_issues(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, custom_action_plan, custom_fecha_de_reporte, custom_tipo)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at, custom_action_plan = EXCLUDED.custom_action_plan, custom_fecha_de_reporte = EXCLUDED.custom_fecha_de_reporte, custom_tipo = EXCLUDED.custom_tipo;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_risks_issues(be_exponential.clickup_task_risks_issues_import_type[]) TO service_role;

-- --- 5. Para la tabla: tasks_documents ---
DROP TYPE IF EXISTS be_exponential.clickup_task_documents_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_documents_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ, custom_fecha_de_firma_cierre TIMESTAMPTZ, custom_archivo TEXT, custom_documento TEXT);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_documents(tasks_data be_exponential.clickup_task_documents_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_documents(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, custom_fecha_de_firma_cierre, custom_archivo, custom_documento)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at, custom_fecha_de_firma_cierre = EXCLUDED.custom_fecha_de_firma_cierre, custom_archivo = EXCLUDED.custom_archivo, custom_documento = EXCLUDED.custom_documento;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_documents(be_exponential.clickup_task_documents_import_type[]) TO service_role;

-- --- 6. Para la tabla: tasks_orders_of_change ---
DROP TYPE IF EXISTS be_exponential.clickup_task_orders_of_change_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_orders_of_change_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ, custom_costo NUMERIC, custom_fecha_de_firma TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_orders_of_change(tasks_data be_exponential.clickup_task_orders_of_change_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_orders_of_change(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, custom_costo, custom_fecha_de_firma)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at, custom_costo = EXCLUDED.custom_costo, custom_fecha_de_firma = EXCLUDED.custom_fecha_de_firma;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_orders_of_change(be_exponential.clickup_task_orders_of_change_import_type[]) TO service_role;

-- --- 7. Para la tabla: tasks_assignments ---
DROP TYPE IF EXISTS be_exponential.clickup_task_assignments_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_assignments_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_assignments(tasks_data be_exponential.clickup_task_assignments_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_assignments(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_assignments(be_exponential.clickup_task_assignments_import_type[]) TO service_role;

-- --- 8. Para la tabla: tasks_project_plan ---
DROP TYPE IF EXISTS be_exponential.clickup_task_project_plan_import_type CASCADE;
CREATE TYPE be_exponential.clickup_task_project_plan_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT, space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT, is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ, custom_duracion_estimada NUMERIC);

CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_project_plan(tasks_data be_exponential.clickup_task_project_plan_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_project_plan(clickup_task_id, clickup_list_id, clickup_folder_id, clickup_space_id, space_name, folder_name, list_name, name, status, priority, assignees, start_date, due_date, time_tracked_ms, is_subtask, parent_task_id, last_synced_at, custom_duracion_estimada)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_space_id = EXCLUDED.clickup_space_id, space_name = EXCLUDED.space_name, folder_name = EXCLUDED.folder_name, list_name = EXCLUDED.list_name, name = EXCLUDED.name, status = EXCLUDED.status, priority = EXCLUDED.priority, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_tracked_ms = EXCLUDED.time_tracked_ms, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id, last_synced_at = EXCLUDED.last_synced_at, custom_duracion_estimada = EXCLUDED.custom_duracion_estimada;
END;
$$;
GRANT EXECUTE ON FUNCTION be_exponential.upsert_tasks_project_plan(be_exponential.clickup_task_project_plan_import_type[]) TO service_role;

COMMIT;
