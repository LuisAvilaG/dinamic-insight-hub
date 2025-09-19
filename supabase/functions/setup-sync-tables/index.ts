
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// =====================================================================================
// VERSIÓN 8 - CORRECCIÓN DE ERROR TIPOGRÁFICO EN TIPO DE DATO
// PROPÓSITO: Corregir el tipo de dato 'TIMESTPTZ' a 'TIMESTAMPTZ'.
// =====================================================================================

const CLICKUP_TO_POSTGRE_TYPE_MAP = {
  'text': 'TEXT', 'string': 'TEXT', 'short_text': 'TEXT', 'url': 'TEXT',
  'email': 'VARCHAR(255)', 'phone': 'VARCHAR(255)', 'drop_down': 'VARCHAR(255)',
  'number': 'NUMERIC', 'money': 'NUMERIC', 'date': 'TIMESTAMPTZ', // <-- CORREGIDO
  'checkbox': 'BOOLEAN', 'users': 'JSONB', 'labels': 'JSONB',
};

const generateTableName = (syncName) => {
  const sanitized = syncName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `sync_${sanitized.slice(0, 50)}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { syncConfig, mappings } = await req.json();

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) throw new Error(`Authentication error: ${userError?.message ?? 'User not found'}`);
    const userId = user.id;

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const tableName = generateTableName(syncConfig.name);
    let columnsSql = `
      clickup_task_id TEXT PRIMARY KEY, clickup_list_id TEXT,
      clickup_folder_id TEXT, clickup_space_id TEXT,
    `;
    if (mappings && Array.isArray(mappings.fields)) {
      mappings.fields.forEach(field => {
        const columnName = field.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const columnType = CLICKUP_TO_POSTGRE_TYPE_MAP[field.type] || 'TEXT';
        columnsSql += `  "${columnName}" ${columnType},\n`;
      });
    }
    columnsSql += `last_synced_at TIMESTAMPTZ DEFAULT NOW()`;
    const createTableSql = `CREATE TABLE IF NOT EXISTS clickup_data.${tableName} (${columnsSql});`;

    const { error: tableError } = await adminClient.rpc('execute_unrestricted_sql', { sql_command: createTableSql });
    if (tableError) throw new Error(`DB RPC Error (execute_unrestricted_sql for create table): ${tableError.message}`);

    const { data: insertedData, error: insertError } = await adminClient
      .from('sync_configs')
      .insert({
        name: syncConfig.name, clickup_workspace_id: syncConfig.workspace, clickup_space_id: syncConfig.space,
        target_schema: 'clickup_data', target_table: tableName, status: 'active', is_active: true,
        cron_schedule: syncConfig.cron_schedule, config: syncConfig.config, user_id: userId,
      })
      .select('id').single();
    if (insertError) throw new Error(`DB Insert Error (sync_configs): ${insertError.message}`);
    
    const syncId = insertedData.id;
    const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/import-clickup-full-be`;
    const cronPayload = JSON.stringify({ sync_id: syncId });
    const cronHeaders = JSON.stringify({
        "Authorization": `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, "Content-Type": "application/json"
    });
    const cronCommand = `SELECT cron.schedule('sync-job-${syncId}', '${syncConfig.cron_schedule}', $$ SELECT net.http_post(url:='${functionUrl}', body:='${cronPayload}'::jsonb, headers:='${cronHeaders}'::jsonb) $$)`;
    
    const { error: cronError } = await adminClient.rpc('execute_unrestricted_sql', { sql_command: cronCommand });
    if (cronError) throw new Error(`DB RPC Error (cron.schedule): ${cronError.message}`);

    return new Response(JSON.stringify({ tableName: `clickup_data.${tableName}`, syncId: syncId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    });

  } catch (error) {
    console.error('[setup-sync-tables] CATCH BLOCK ERROR:', { errorMessage: error.message, errorStack: error.stack });
    return new Response(JSON.stringify({ error: 'An internal error occurred.', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500,
    });
  }
});
