
-- =====================================================================================
-- MIGRACIÓN DE RECONSTRUCCIÓN FINAL DE FUNCIONES RPC (CORREGIDO)
-- FECHA: 2025-09-13
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Crear un tipo y una función de upsert para cada una de las 7 tablas
--            finales, alineadas con el manifiesto schema_definition.json. (v2)
-- =====================================================================================

BEGIN;

-- --- 1. Para la tabla: tasks_project_information ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_project_information(be_exponential.clickup_task_project_information_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_project_information_import_type;
CREATE TYPE be_exponential.clickup_task_project_information_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, custom_Project_Manager TEXT, custom_fase_del_proyecto TEXT, custom_fecha_de_kick_off TIMESTAMPTZ, custom_fecha_planeada_go_live TIMESTAMPTZ, custom_horas_contratadas NUMERIC, custom_horas_proyecto NUMERIC, custom_horas_integraciones_o_desarrollos NUMERIC, last_synced_at TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_project_information(tasks_data be_exponential.clickup_task_project_information_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_project_information(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, custom_Project_Manager, custom_fase_del_proyecto, custom_fecha_de_kick_off, custom_fecha_planeada_go_live, custom_horas_contratadas, custom_horas_proyecto, custom_horas_integraciones_o_desarrollos, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, custom_Project_Manager = EXCLUDED.custom_Project_Manager, custom_fase_del_proyecto = EXCLUDED.custom_fase_del_proyecto, custom_fecha_de_kick_off = EXCLUDED.custom_fecha_de_kick_off, custom_fecha_planeada_go_live = EXCLUDED.custom_fecha_planeada_go_live, custom_horas_contratadas = EXCLUDED.custom_horas_contratadas, custom_horas_proyecto = EXCLUDED.custom_horas_proyecto, custom_horas_integraciones_o_desarrollos = EXCLUDED.custom_horas_integraciones_o_desarrollos, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;

-- --- 2. Para la tabla: tasks_action_items ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_action_items(be_exponential.clickup_task_action_items_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_action_items_import_type;
CREATE TYPE be_exponential.clickup_task_action_items_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, status TEXT, custom_Responsable TEXT, priority TEXT, start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, last_synced_at TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_action_items(tasks_data be_exponential.clickup_task_action_items_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_action_items(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, status, custom_Responsable, priority, start_date, due_date, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, status = EXCLUDED.status, custom_Responsable = EXCLUDED.custom_Responsable, priority = EXCLUDED.priority, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;

-- --- 3. Para la tabla: tasks_gaps ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_gaps(be_exponential.clickup_task_gaps_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_gaps_import_type;
CREATE TYPE be_exponential.clickup_task_gaps_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, status TEXT, custom_Gap_Estatus TEXT, priority TEXT, custom_detalles TEXT, custom_fecha_de_identificacion TIMESTAMPTZ, custom_hrs_estimadas NUMERIC, last_synced_at TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_gaps(tasks_data be_exponential.clickup_task_gaps_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_gaps(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, status, custom_Gap_Estatus, priority, custom_detalles, custom_fecha_de_identificacion, custom_hrs_estimadas, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, status = EXCLUDED.status, custom_Gap_Estatus = EXCLUDED.custom_Gap_Estatus, priority = EXCLUDED.priority, custom_detalles = EXCLUDED.custom_detalles, custom_fecha_de_identificacion = EXCLUDED.custom_fecha_de_identificacion, custom_hrs_estimadas = EXCLUDED.custom_hrs_estimadas, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;

-- --- 4. Para la tabla: tasks_risks_issues ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_risks_issues(be_exponential.clickup_task_risks_issues_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_risks_issues_import_type;
CREATE TYPE be_exponential.clickup_task_risks_issues_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, custom_Responsable TEXT, priority TEXT, status TEXT, custom_Estatus TEXT, custom_action_plan TEXT, custom_fecha_de_reporte TIMESTAMPTZ, custom_tipo TEXT, last_synced_at TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_risks_issues(tasks_data be_exponential.clickup_task_risks_issues_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_risks_issues(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, custom_Responsable, priority, status, custom_Estatus, custom_action_plan, custom_fecha_de_reporte, custom_tipo, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, custom_Responsable = EXCLUDED.custom_Responsable, priority = EXCLUDED.priority, status = EXCLUDED.status, custom_Estatus = EXCLUDED.custom_Estatus, custom_action_plan = EXCLUDED.custom_action_plan, custom_fecha_de_reporte = EXCLUDED.custom_fecha_de_reporte, custom_tipo = EXCLUDED.custom_tipo, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;

-- --- 5. Para la tabla: tasks_documents ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_documents(be_exponential.clickup_task_documents_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_documents_import_type;
CREATE TYPE be_exponential.clickup_task_documents_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, status TEXT, custom_Documento TEXT, custom_Estatus TEXT, custom_fase_del_proyecto TEXT, custom_fecha_de_firma_cierre TIMESTAMPTZ, last_synced_at TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_documents(tasks_data be_exponential.clickup_task_documents_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_documents(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, status, custom_Documento, custom_Estatus, custom_fase_del_proyecto, custom_fecha_de_firma_cierre, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, status = EXCLUDED.status, custom_Documento = EXCLUDED.custom_Documento, custom_Estatus = EXCLUDED.custom_Estatus, custom_fase_del_proyecto = EXCLUDED.custom_fase_del_proyecto, custom_fecha_de_firma_cierre = EXCLUDED.custom_fecha_de_firma_cierre, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;

-- --- 6. Para la tabla: tasks_orders_of_change ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_orders_of_change(be_exponential.clickup_task_orders_of_change_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_orders_of_change_import_type;
CREATE TYPE be_exponential.clickup_task_orders_of_change_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, priority TEXT, status TEXT, custom_Impacto TEXT, custom_Estatus TEXT, custom_costo NUMERIC, custom_fecha_de_firma TIMESTAMPTZ, last_synced_at TIMESTAMPTZ);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_orders_of_change(tasks_data be_exponential.clickup_task_orders_of_change_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_orders_of_change(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, priority, status, custom_Impacto, custom_Estatus, custom_costo, custom_fecha_de_firma, last_synced_at)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, priority = EXCLUDED.priority, status = EXCLUDED.status, custom_Impacto = EXCLUDED.custom_Impacto, custom_Estatus = EXCLUDED.custom_Estatus, custom_costo = EXCLUDED.custom_costo, custom_fecha_de_firma = EXCLUDED.custom_fecha_de_firma, last_synced_at = EXCLUDED.last_synced_at;
END;
$$;

-- --- 7. Para la tabla: tasks_project_plan ---
DROP FUNCTION IF EXISTS be_exponential.upsert_tasks_project_plan(be_exponential.clickup_task_project_plan_import_type[]);
DROP TYPE IF EXISTS be_exponential.clickup_task_project_plan_import_type;
CREATE TYPE be_exponential.clickup_task_project_plan_import_type AS (clickup_task_id TEXT, clickup_list_id TEXT, clickup_list_name TEXT, clickup_folder_id TEXT, clickup_folder_name TEXT, name TEXT, status TEXT, assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_spent NUMERIC, time_estimate NUMERIC, last_synced_at TIMESTAMPTZ, is_subtask BOOLEAN, parent_task_id TEXT);
CREATE OR REPLACE FUNCTION be_exponential.upsert_tasks_project_plan(tasks_data be_exponential.clickup_task_project_plan_import_type[]) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO be_exponential.tasks_project_plan(clickup_task_id, clickup_list_id, clickup_list_name, clickup_folder_id, clickup_folder_name, name, status, assignees, start_date, due_date, time_spent, time_estimate, last_synced_at, is_subtask, parent_task_id)
    SELECT u.* FROM unnest(tasks_data) u
    ON CONFLICT (clickup_task_id) DO UPDATE SET
        clickup_list_id = EXCLUDED.clickup_list_id, clickup_list_name = EXCLUDED.clickup_list_name, clickup_folder_id = EXCLUDED.clickup_folder_id, clickup_folder_name = EXCLUDED.clickup_folder_name, name = EXCLUDED.name, status = EXCLUDED.status, assignees = EXCLUDED.assignees, start_date = EXCLUDED.start_date, due_date = EXCLUDED.due_date, time_spent = EXCLUDED.time_spent, time_estimate = EXCLUDED.time_estimate, last_synced_at = EXCLUDED.last_synced_at, is_subtask = EXCLUDED.is_subtask, parent_task_id = EXCLUDED.parent_task_id;
END;
$$;

COMMIT;
