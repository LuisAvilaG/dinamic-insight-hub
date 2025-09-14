-- =====================================================================================
-- MIGRACIÓN PARA EXPONER TABLAS DEL ESQUEMA be_exponential A LA API PÚBLICA
-- FECHA: 2025-10-04
-- AUTOR: Gemini AI Assistant
-- PROPÓSITO: Corregir el error 404 Not Found al intentar insertar datos en tablas
--            que no están en el esquema 'public'. Esto se hace añadiendo las tablas
--            del esquema be_exponential a la publicación de Supabase para que la API
--            REST pueda encontrarlas.
-- =====================================================================================

-- 1. Añadir la tabla 'report_widgets' a la publicación de la API.
--    Esto permite que supabase.from('report_widgets') funcione correctamente.
ALTER PUBLICATION supabase_realtime ADD TABLE be_exponential.report_widgets;

-- 2. Añadir la tabla 'report_dashboards' también, previendo futuros problemas.
--    Esto permite que supabase.from('report_dashboards') funcione correctamente.
ALTER PUBLICATION supabase_realtime ADD TABLE be_exponential.report_dashboards;
