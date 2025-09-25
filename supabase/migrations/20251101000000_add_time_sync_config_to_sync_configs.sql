-- add_time_sync_config_to_sync_configs.sql

ALTER TABLE clickup.sync_configs
ADD COLUMN time_sync_initial_history_load BOOLEAN DEFAULT FALSE,
ADD COLUMN time_sync_scope TEXT,
ADD COLUMN time_sync_custom_start_date TIMESTAMPTZ,
ADD COLUMN time_sync_custom_end_date TIMESTAMPTZ,
ADD COLUMN last_clickup_time_entry_processed_at TIMESTAMPTZ;

-- Opcional: Si quieres un valor predeterminado para las configuraciones existentes de tipo 'tasks'
-- UPDATE clickup.sync_configs
-- SET time_sync_scope = 'last_week'
-- WHERE sync_type = 'time_entries' AND time_sync_scope IS NULL;
