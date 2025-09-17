
-- =====================================================================================
-- MIGRACIÓN: Añadir nuevos tipos de widgets al enum
-- FECHA: 2025-10-11
-- AUTOR: AI Assistant
-- PROPÓSITO: Actualizar el tipo enum `widget_type` en el esquema `be_exponential` para
--            incluir los nuevos widgets de tabla que utilizan la librería WebDataRocks.
-- =====================================================================================

-- Añadir los nuevos valores al tipo enum existente
ALTER TYPE be_exponential.widget_type ADD VALUE 'data_table';
ALTER TYPE be_exponential.widget_type ADD VALUE 'advanced_table';
