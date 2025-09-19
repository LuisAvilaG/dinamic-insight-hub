CREATE TABLE clickup.sync_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  clickup_workspace_id TEXT NOT NULL,
  clickup_space_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive', -- active, inactive, error
  last_run_at TIMESTAMPTZ,
  last_run_result TEXT,
  next_run_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
