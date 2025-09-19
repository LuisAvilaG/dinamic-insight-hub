-- =====================================================================================
-- MIGRACIÓN: Añadir el tipo de widget de Tabla Dinámica (Pivot Table)
-- FECHA: 2025-10-14
-- AUTOR: AI Assistant
-- PROPÓSITO: Actualizar el tipo enum `widget_type` para incluir 'pivot_table',
--            permitiendo que los nuevos widgets de tabla dinámica se guarden
--            correctamente en la base de datos.
-- =====================================================================================

ALTER TYPE be_exponential.widget_type ADD VALUE 'pivot_table';
