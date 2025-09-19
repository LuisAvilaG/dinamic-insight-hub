-- =====================================================================================
-- MIGRACIÓN CORRECTIVA PARA EL ESQUEMA DE sync_configs
-- FECHA: 2025-10-16
-- AUTOR: AI Assistant
-- PROPÓSITO: Solucionar la causa raíz del persistente error 500. Se añaden
--            las columnas que faltan en la tabla 'clickup.sync_configs' para que
--            coincida con la estructura de datos que la Edge Function
--            'setup-sync-tables' intenta insertar.
-- =====================================================================================

ALTER TABLE clickup.sync_configs
ADD COLUMN IF NOT EXISTS target_schema TEXT,
ADD COLUMN IF NOT EXISTS target_table TEXT,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS last_run_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_run_status TEXT;

-- Comentario: Se añaden también 'last_run_at' y 'last_run_status'
-- para futuras mejoras en el monitoreo de las sincronizaciones.
