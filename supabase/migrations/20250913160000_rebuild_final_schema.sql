
-- =====================================================================================
-- MIGRACIÓN DE RECONSTRUCCIÓN FINAL BASADA EN EL MANIFIESTO DEL USUARIO (schema_definition.json)
-- FECHA: 2025-09-13
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Destruir la estructura de tablas anterior y reconstruirla con precisión
--            según el manifiesto final validado, incluyendo todas las personalizaciones.
-- =====================================================================================

BEGIN;

-- PASO 1: Destrucción controlada y completa de la estructura anterior.
-- Se eliminan las 8 tablas originales para asegurar un estado limpio.
DROP TABLE IF EXISTS be_exponential.tasks_project_information CASCADE;
DROP TABLE IF EXISTS be_exponential.tasks_action_items CASCADE;
DROP TABLE IF EXISTS be_exponential.tasks_gaps CASCADE;
DROP TABLE IF EXISTS be_exponential.tasks_risks_issues CASCADE;
DROP TABLE IF EXISTS be_exponential.tasks_documents CASCADE;
DROP TABLE IF EXISTS be_exponential.tasks_orders_of_change CASCADE;
DROP TABLE IF EXISTS be_exponential.tasks_assignments CASCADE; -- Eliminada según instrucción
DROP TABLE IF EXISTS be_exponential.tasks_project_plan CASCADE;

-- PASO 2: Re-creación precisa de cada tabla según el manifiesto final.

CREATE TABLE be_exponential.tasks_project_information (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    custom_Project_Manager TEXT,
    custom_fase_del_proyecto TEXT,
    custom_fecha_de_kick_off TIMESTAMPTZ,
    custom_fecha_planeada_go_live TIMESTAMPTZ,
    custom_horas_contratadas NUMERIC,
    custom_horas_proyecto NUMERIC,
    custom_horas_integraciones_o_desarrollos NUMERIC,
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE be_exponential.tasks_action_items (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    status TEXT,
    custom_Responsable TEXT,
    priority TEXT,
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE be_exponential.tasks_gaps (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    status TEXT,
    custom_Gap_Estatus TEXT,
    priority TEXT,
    custom_detalles TEXT,
    custom_fecha_de_identificacion TIMESTAMPTZ,
    custom_hrs_estimadas NUMERIC,
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE be_exponential.tasks_risks_issues (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    custom_Responsable TEXT,
    priority TEXT,
    status TEXT,
    custom_Estatus TEXT,
    custom_action_plan TEXT,
    custom_fecha_de_reporte TIMESTAMPTZ,
    custom_tipo TEXT,
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE be_exponential.tasks_documents (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    status TEXT,
    custom_Documento TEXT,
    custom_Estatus TEXT,
    custom_fase_del_proyecto TEXT,
    custom_fecha_de_firma_cierre TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE be_exponential.tasks_orders_of_change (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    priority TEXT,
    status TEXT,
    custom_Impacto TEXT,
    custom_Estatus TEXT,
    custom_costo NUMERIC,
    custom_fecha_de_firma TIMESTAMPTZ,
    last_synced_at TIMESTAMPTZ
);

CREATE TABLE be_exponential.tasks_project_plan (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT,
    clickup_list_name TEXT,
    clickup_folder_id TEXT,
    clickup_folder_name TEXT,
    name TEXT,
    status TEXT,
    assignees TEXT[],
    start_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    time_spent NUMERIC,
    time_estimate NUMERIC,
    last_synced_at TIMESTAMPTZ,
    is_subtask BOOLEAN,
    parent_task_id TEXT
);

COMMIT;
