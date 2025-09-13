
-- PASO 1: Añadir columnas para los nombres de Space, Folder y List para facilitar las consultas.
ALTER TABLE be_exponential.tasks
ADD COLUMN IF NOT EXISTS space_name TEXT,
ADD COLUMN IF NOT EXISTS folder_name TEXT,
ADD COLUMN IF NOT EXISTS list_name TEXT;

-- PASO 2: Eliminar la columna específica anterior para evitar conflictos.
ALTER TABLE be_exponential.tasks
DROP COLUMN IF EXISTS custom_hrs_estimadas;

-- PASO 3: Añadir todas las columnas personalizadas identificadas en el knowledge_base.
-- Se usa ADD COLUMN IF NOT EXISTS para seguridad en caso de que la migración se ejecute más de una vez.
ALTER TABLE be_exponential.tasks
    -- Campos de "Project Information"
    ADD COLUMN IF NOT EXISTS custom_fecha_planeada_go_live TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS custom_fecha_inicio TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS custom_fecha_limite_linea_base TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS custom_horas_totales NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_hrs_estimadas NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_dias_num NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_total_dias_num NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_prioridad_cliente NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_estado_proyecto TEXT,
    ADD COLUMN IF NOT EXISTS custom_escalar_al BOOLEAN,

    -- Campos de "Dinamic"
    ADD COLUMN IF NOT EXISTS custom_porcentaje_completado TEXT,
    ADD COLUMN IF NOT EXISTS custom_horas_proyecto NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_plan_de_accion TEXT,
    ADD COLUMN IF NOT EXISTS custom_tipo_asignacion TEXT,
    ADD COLUMN IF NOT EXISTS custom_nombre_cliente_be_exp TEXT,
    ADD COLUMN IF NOT EXISTS custom_facturable_dinamic_2 BOOLEAN,
    ADD COLUMN IF NOT EXISTS custom_sprint TEXT,

    -- Campos de "Dinamic Backlog"
    ADD COLUMN IF NOT EXISTS custom_nombre_desarrollo TEXT,
    ADD COLUMN IF NOT EXISTS custom_tag_pais TEXT,
    ADD COLUMN IF NOT EXISTS custom_fecha_limite TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS custom_duracion_estimada NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_sprints TEXT, -- Plural para diferenciar de "custom_sprint"
    ADD COLUMN IF NOT EXISTS custom_estimacion NUMERIC,

    -- Campos de "Backlog Forecast"
    ADD COLUMN IF NOT EXISTS custom_probabilidad_cierre NUMERIC,

    -- Campos Comunes ("common_fields_dinamic")
    ADD COLUMN IF NOT EXISTS custom_consumidas_sem39 NUMERIC,
    ADD COLUMN IF NOT EXISTS custom_prioridad NUMERIC;

-- Comentario final: La tabla `tasks` ahora está alineada con la estructura "ancha" solicitada.
-- El siguiente paso es actualizar la función RPC para que pueda manejar estas nuevas columnas.
