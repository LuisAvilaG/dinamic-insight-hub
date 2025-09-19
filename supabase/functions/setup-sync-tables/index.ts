// =====================================================================================
// Supabase Edge Function: setup-sync-tables
// v12: INVOCACIÓN ASÍNCRONA
// OBJETIVO:
// 1. Eliminar el 'await' al invocar la función de importación.
// 2. Esto permite que la función de configuración responda inmediatamente al frontend,
//    mientras que la importación de datos se ejecuta en segundo plano.
// 3. Mejora drásticamente la experiencia de usuario, evitando largas esperas.
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
    const { syncConfig, mappings, schedule, mode } = await req.json();
    if (!syncConfig || !mappings) throw new Error('syncConfig and mappings are required.');

    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization')! } } });
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) throw new Error(`Authentication error: ${userError?.message || 'User not found'}`);
    const userId = user.id;

    const adminClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const tableName = generateTableName(syncConfig.name);
    let columnsSql = `clickup_task_id TEXT PRIMARY KEY, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,\n`;
    if (mappings && Array.isArray(mappings.fields)) {
      mappings.fields.forEach(field => {
        const columnName = field.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const columnType = CLICKUP_TO_POSTGRE_TYPE_MAP[field.type] || 'TEXT';
        columnsSql += `  "${columnName}" ${columnType},\n`;
      });
    }
    columnsSql += `last_synced_at TIMESTAMPTZ DEFAULT NOW()`;
    
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
        mappings: mappings,
        mode: mode,
        is_full_sync_fields: syncConfig.is_full_sync_fields,
      },
      user_id: userId,
      next_run_at: nextRunAt,
    };

    const { data: insertedData, error: insertError } = await clickupAdminClient.from('sync_configs').insert(insertPayload).select('id').single();
    if (insertError) throw new Error(`DB Insert Error (sync_configs): ${insertError.message}`);
    const syncId = insertedData.id;

    if (insertPayload.cron_schedule) {
        const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/import-clickup-full-be`;
        const cronPayload = JSON.stringify({ sync_id: syncId });
        const cronHeaders = JSON.stringify({ "Authorization": `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`, "Content-Type": "application/json" });
        const cronCommand = `SELECT cron.schedule('sync-job-${syncId}', '${insertPayload.cron_schedule}', $$ SELECT net.http_post(url:='${functionUrl}', body:='${cronPayload}'::jsonb, headers:='${cronHeaders}'::jsonb) $$)`;
        await adminClient.rpc('execute_unrestricted_sql', { sql_command: cronCommand });
    }

    // --- CAMBIO CLAVE: INVOCACIÓN ASÍNCRONA ---
    // No usamos 'await' para que la función responda inmediatamente.
    adminClient.functions.invoke('import-clickup-full-be', { body: { sync_id: syncId } });
    
    // El estado se quedará como 'queued'. La función 'import-clickup-full-be' 
    // es ahora responsable de actualizarlo a 'running' y luego a 'active' o 'failed'.

    return new Response(JSON.stringify({ tableName: `clickup_data.${tableName}`, syncId: syncId }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: 'An internal error occurred.', details: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});