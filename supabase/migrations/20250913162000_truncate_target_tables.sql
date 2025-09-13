
-- =====================================================================================
-- MIGRACIÓN: Truncar todas las tablas de destino de ClickUp
-- FECHA: 2025-09-13
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Limpiar todas las tablas de destino antes de una nueva importación completa.
--            El uso de TRUNCATE es más eficiente que DELETE y reinicia las secuencias
--            de identidad. CASCADE se usa para manejar cualquier dependencia.
-- =====================================================================================

BEGIN;

TRUNCATE TABLE be_exponential.tasks_project_information RESTART IDENTITY CASCADE;
TRUNCATE TABLE be_exponential.tasks_action_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE be_exponential.tasks_gaps RESTART IDENTITY CASCADE;
TRUNCATE TABLE be_exponential.tasks_risks_issues RESTART IDENTITY CASCADE;
TRUNCATE TABLE be_exponential.tasks_documents RESTART IDENTITY CASCADE;
TRUNCATE TABLE be_exponential.tasks_orders_of_change RESTART IDENTITY CASCADE;
TRUNCATE TABLE be_exponential.tasks_project_plan RESTART IDENTITY CASCADE;

COMMIT;
