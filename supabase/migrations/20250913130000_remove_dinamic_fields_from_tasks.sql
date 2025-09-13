
-- OBJETIVO: Eliminar las columnas relacionadas con "Dinamic" que se añadieron por error a la tabla de tasks.
-- Esto corrige la estructura para que solo contenga campos de "Corporative Projects".

ALTER TABLE be_exponential.tasks
    -- Campos de "Dinamic"
    DROP COLUMN IF EXISTS custom_porcentaje_completado,
    DROP COLUMN IF EXISTS custom_horas_proyecto,
    DROP COLUMN IF EXISTS custom_plan_de_accion,
    DROP COLUMN IF EXISTS custom_tipo_asignacion,
    DROP COLUMN IF EXISTS custom_nombre_cliente_be_exp,
    DROP COLUMN IF EXISTS custom_facturable_dinamic_2,
    DROP COLUMN IF EXISTS custom_sprint,

    -- Campos de "Dinamic Backlog"
    DROP COLUMN IF EXISTS custom_nombre_desarrollo,
    DROP COLUMN IF EXISTS custom_tag_pais,
    DROP COLUMN IF EXISTS custom_fecha_limite,
    DROP COLUMN IF EXISTS custom_duracion_estimada,
    DROP COLUMN IF EXISTS custom_sprints,
    DROP COLUMN IF EXISTS custom_estimacion,

    -- Campos de "Backlog Forecast"
    DROP COLUMN IF EXISTS custom_probabilidad_cierre,

    -- Campos Comunes de "Dinamic"
    DROP COLUMN IF EXISTS custom_consumidas_sem39,
    DROP COLUMN IF EXISTS custom_prioridad; -- Se elimina porque ya existe un campo nativo de prioridad.
