-- ==================================================================
-- MIGRACIÓN INICIAL: ESQUEMA DE BE EXPONENTIAL (CLICKUP)
-- ==================================================================
-- OBJETIVO: Crear la estructura de tablas para sincronizar los datos
-- del espacio "Corporative Projects" desde ClickUp.
-- ==================================================================

-- PASO 1: Crear un esquema dedicado para aislar los datos de Be Exponential.
CREATE SCHEMA IF NOT EXISTS be_exponential;

-- PASO 2: Crear la tabla principal para las tareas.
-- Esta tabla consolida campos estándar de ClickUp y campos personalizados
-- clave identificados en la base de conocimiento.
CREATE TABLE IF NOT EXISTS be_exponential.tasks (
  -- Identificadores únicos y de relación
  clickup_task_id TEXT PRIMARY KEY,       -- ID único de la tarea en ClickUp
  clickup_list_id TEXT NOT NULL,          -- ID de la lista a la que pertenece
  clickup_folder_id TEXT,                 -- ID de la carpeta (cliente) a la que pertenece
  clickup_space_id TEXT NOT NULL,         -- ID del espacio (Corporative Projects)

  -- Campos estándar de Tarea
  name TEXT NOT NULL,                     -- Nombre de la tarea
  status TEXT,                            -- Estado actual (e.g., "en progreso")
  assignees JSONB,                        -- Asignados (puede ser una lista)
  priority TEXT,                          -- Prioridad de la tarea
  start_date TIMESTAMPTZ,                 -- Fecha de inicio
  due_date TIMESTAMPTZ,                   -- Fecha de vencimiento
  time_tracked_ms BIGINT,                 -- Tiempo registrado (en milisegundos)
  is_subtask BOOLEAN DEFAULT FALSE,       -- TRUE si es una subtarea
  parent_task_id TEXT,                    -- ID de la tarea padre si es una subtarea

  -- Campos Personalizados de "Project Information"
  custom_fecha_go_live TIMESTAMPTZ,       -- "Fecha Planeada de Go live"
  custom_estado_proyecto TEXT,            -- "Estado proyecto"
  custom_horas_totales NUMERIC,           -- "Horas totales"
  custom_hrs_estimadas NUMERIC,           -- "Hrs Estimadas"

  -- Campos Personalizados de otras listas (Gaps, ODCs)
  custom_costo_odc NUMERIC,               -- "Costo" (de Ordenes de Cambio)

  -- Metadatos para la sincronización
  created_at TIMESTAMPTZ DEFAULT NOW(),  -- Cuándo se creó el registro en nuestra BD
  last_synced_at TIMESTAMPTZ             -- Cuándo se actualizó por última vez desde ClickUp
);

-- PASO 3: Crear índices para optimizar las consultas comunes.
-- Los dashboards y reportes frecuentemente filtrarán por estas columnas.
CREATE INDEX IF NOT EXISTS idx_be_tasks_list_id ON be_exponential.tasks(clickup_list_id);
CREATE INDEX IF NOT EXISTS idx_be_tasks_folder_id ON be_exponential.tasks(clickup_folder_id);
CREATE INDEX IF NOT EXISTS idx_be_tasks_status ON be_exponential.tasks(status);


-- PASO 4: Habilitar Row Level Security (RLS) en la tabla.
-- Es una buena práctica de seguridad para futuras políticas de acceso.
ALTER TABLE be_exponential.tasks ENABLE ROW LEVEL SECURITY;

-- Por defecto, nadie puede ver la información. Se necesitarán políticas explícitas.
CREATE POLICY "Denegar acceso público" ON be_exponential.tasks FOR ALL USING (FALSE);

-- Ejemplo de política (comentada): Permitir a los usuarios autenticados leer todo.
-- CREATE POLICY "Permitir acceso de lectura a usuarios autenticados" 
-- ON be_exponential.tasks FOR SELECT 
-- USING (auth.role() = 'authenticated');

COMMENT ON COLUMN be_exponential.tasks.time_tracked_ms IS 'Almacena el tiempo registrado en milisegundos para mayor precisión.';
COMMENT ON TABLE be_exponential.tasks IS 'Tabla que contiene las tareas sincronizadas desde el espacio "Corporative Projects" de ClickUp para Be Exponential.';
