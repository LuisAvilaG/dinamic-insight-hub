CREATE TABLE clickup.user_clickup_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE clickup.user_clickup_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow users to manage their own tokens"
ON clickup.user_clickup_tokens
FOR ALL
USING (auth.uid() = user_id);
