
-- =====================================================================================
-- MIGRACIÓN PARA LA ARQUITECTURA MULTI-TABLA DE TAREAS
-- FECHA: 2025-09-13
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Implementar una tabla dedicada para cada tipo de lista de ClickUp
--            en el espacio "Corporative Projects", según la nueva estrategia.
-- =====================================================================================

BEGIN;

-- PASO 1: Eliminar la tabla "ancha" anterior para empezar desde un estado limpio.
DROP TABLE IF EXISTS be_exponential.tasks;

-- PASO 2: Crear una tabla para cada tipo de lista con sus columnas específicas.

-- Tabla base para: Project Information
CREATE TABLE IF NOT EXISTS be_exponential.tasks_project_information (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ,
    -- Campos personalizados de "Project Information"
    custom_fecha_planeada_go_live TIMESTAMPTZ,
    custom_fecha_de_kick_off TIMESTAMPTZ,
    custom_horas_proyecto NUMERIC,
    custom_horas_contratadas NUMERIC,
    custom_horas_integraciones_o_desarrollos NUMERIC,
    custom_fase_del_proyecto TEXT
);

-- Tabla base para: Action Items
CREATE TABLE IF NOT EXISTS be_exponential.tasks_action_items (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ
    -- No tiene campos personalizados únicos en 'important_fields'.
);

-- Tabla base para: Gaps
CREATE TABLE IF NOT EXISTS be_exponential.tasks_gaps (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ,
    -- Campos personalizados de "Gaps"
    custom_detalles TEXT,
    custom_fecha_de_identificacion TIMESTAMPTZ,
    custom_hrs_estimadas NUMERIC
);

-- Tabla base para: Riesgos - Issues
CREATE TABLE IF NOT EXISTS be_exponential.tasks_risks_issues (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ,
    -- Campos personalizados de "Riesgos - Issues"
    custom_action_plan TEXT,
    custom_fecha_de_reporte TIMESTAMPTZ,
    custom_tipo TEXT
);

-- Tabla base para: Documentos
CREATE TABLE IF NOT EXISTS be_exponential.tasks_documents (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ,
    -- Campos personalizados de "Documentos"
    custom_fecha_de_firma_cierre TIMESTAMPTZ,
    custom_archivo TEXT, -- Se asume que guardará una URL
    custom_documento TEXT -- Se asume que guardará una URL
);

-- Tabla base para: Ordenes de Cambio
CREATE TABLE IF NOT EXISTS be_exponential.tasks_orders_of_change (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ,
    -- Campos personalizados de "Ordenes de Cambio"
    custom_costo NUMERIC,
    custom_fecha_de_firma TIMESTAMPTZ
);

-- Tabla base para: Asignaciones
CREATE TABLE IF NOT EXISTS be_exponential.tasks_assignments (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ
    -- No tiene campos personalizados únicos en 'important_fields'.
);

-- Tabla base para: Project Plan
CREATE TABLE IF NOT EXISTS be_exponential.tasks_project_plan (
    clickup_task_id TEXT PRIMARY KEY,
    clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,
    space_name TEXT, folder_name TEXT, list_name TEXT, name TEXT, status TEXT, priority TEXT,
    assignees TEXT[], start_date TIMESTAMPTZ, due_date TIMESTAMPTZ, time_tracked_ms BIGINT,
    is_subtask BOOLEAN, parent_task_id TEXT, last_synced_at TIMESTAMPTZ,
    -- Campos personalizados de "Project Plan"
    custom_duracion_estimada NUMERIC
);

COMMIT;
