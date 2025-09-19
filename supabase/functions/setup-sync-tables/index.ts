// =====================================================================================
// Supabase Edge Function: setup-sync-tables
// v13: SOPORTE PARA TIPOS DE SINCRONIZACIÓN
// OBJETIVO:
// 1. Añadir un parámetro 'sync_type' al payload.
// 2. Crear una estructura de tabla diferente si el tipo es 'time_entries'.
// 3. Almacenar el 'sync_type' en la configuración de la base de datos.
// 4. Invocar la Edge Function correcta ('import-clickup-full-be' o
//    'import-clickup-time-entries') basado en el tipo.
// =====================================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { parseExpression } from 'https://esm.sh/cron-parser@4.9.0';

const CLICKUP_TO_POSTGRE_TYPE_MAP = {
  'text': 'TEXT', 'string': 'TEXT', 'short_text': 'TEXT', 'url': 'TEXT',
  'email': 'VARCHAR(255)', 'phone': 'VARCHAR(255)', 'drop_down': 'VARCHAR(255)',
  'number': 'NUMERIC', 'money': 'NUMERIC', 'date': 'TIMESTAMPTZ',
  'checkbox': 'BOOLEAN', 'users': 'JSONB', 'labels': 'JSONB',
};

const generateTableName = (syncName) => {
  const sanitized = syncName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `sync_${sanitized.slice(0, 50)}`;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { syncConfig, mappings, schedule, mode, sync_type } = await req.json();
    if (!syncConfig || !sync_type) throw new Error('syncConfig and sync_type are required.');

    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization')! } } });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) throw new Error(`Authentication error: ${userError?.message || 'User not found'}`);
    const userId = user.id;

    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const tableName = generateTableName(syncConfig.name);
    let columnsSql = '';

    if (sync_type === 'tasks') {
        if (!mappings || !Array.isArray(mappings.fields)) throw new Error("Mappings are required for 'tasks' sync type.");
        columnsSql = `clickup_task_id TEXT PRIMARY KEY, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,\n`;
        mappings.fields.forEach(field => {
            const columnName = field.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
            const columnType = CLICKUP_TO_POSTGRE_TYPE_MAP[field.type] || 'TEXT';
            columnsSql += `  "${columnName}" ${columnType},\n`;
        });
        columnsSql += `last_synced_at TIMESTAMPTZ DEFAULT NOW()`;
    } else if (sync_type === 'time_entries') {
        columnsSql = `
            id TEXT PRIMARY KEY,
            start_time TIMESTAMPTZ,
            end_time TIMESTAMPTZ,
            duration_ms BIGINT,
            description TEXT,
            clickup_user_id BIGINT,
            clickup_task_id TEXT,
            clickup_list_id TEXT,
            clickup_space_id TEXT,
            last_synced_at TIMESTAMPTZ DEFAULT NOW()
        `;
    } else {
        throw new Error(`Unsupported sync_type: ${sync_type}`);
    }
    
    const createTableSql = `CREATE TABLE IF NOT EXISTS clickup_data."${tableName}" (${columnsSql});`;
    await adminClient.rpc('execute_unrestricted_sql', { sql_command: createTableSql });
    
    const grantSql = `GRANT ALL ON TABLE clickup_data."${tableName}" TO service_role;`;
    await adminClient.rpc('execute_unrestricted_sql', { sql_command: grantSql });

    const clickupAdminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { db: { schema: 'clickup' } });

    let nextRunAt = null;
    if (syncConfig.cron_schedule) {
        try {
            nextRunAt = parseExpression(syncConfig.cron_schedule).next().toISOString();
        } catch (err) {
            throw new Error(`Invalid cron schedule: ${syncConfig.cron_schedule}`);
        }
    }

    const insertPayload = {
      name: syncConfig.name,
      sync_type: sync_type,
      clickup_workspace_id: syncConfig.workspace,
      clickup_space_id: syncConfig.space,
      clickup_workspace_name: syncConfig.workspaceName,
      clickup_space_name: syncConfig.spaceName,
      target_schema: 'clickup_data',
      target_table: tableName,
      status: 'queued',
      is_active: true,
      cron_schedule: syncConfig.cron_schedule || null,
      config: {
        schedule: schedule,
        mappings: mappings, // Can be null for time_entries
        mode: mode,
        time_sync_config: syncConfig.time_sync_config // New field for time entry specific settings
      },
      user_id: userId,
      next_run_at: nextRunAt,
    };

    const { data: insertedData, error: insertError } = await clickupAdminClient.from('sync_configs').insert(insertPayload).select('id').single();
    if (insertError) throw new Error(`DB Insert Error (sync_configs): ${insertError.message}`);
    const syncId = insertedData.id;

    const functionToInvoke = sync_type === 'tasks' ? 'import-clickup-full-be' : 'import-clickup-time-entries';

    if (insertPayload.cron_schedule) {
        const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionToInvoke}`;
        const cronPayload = JSON.stringify({ sync_id: syncId });
        const cronHeaders = JSON.stringify({ "Authorization": `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, "Content-Type": "application/json" });
        const cronCommand = `SELECT cron.schedule('sync-job-${syncId}', '${insertPayload.cron_schedule}', $$ SELECT net.http_post(url:='${functionUrl}', body:='${cronPayload}'::jsonb, headers:='${cronHeaders}'::jsonb) $$)`;
        await adminClient.rpc('execute_unrestricted_sql', { sql_command: cronCommand });
    }

    adminClient.functions.invoke(functionToInvoke, { body: { sync_id: syncId } });

    return new Response(JSON.stringify({ tableName: `clickup_data.${tableName}`, syncId: syncId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'An internal error occurred.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});