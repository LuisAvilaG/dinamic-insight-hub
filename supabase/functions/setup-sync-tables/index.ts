// =====================================================================================
// Supabase Edge Function: setup-sync-tables
// OBJETIVO:
// - Versión estable y funcional del creador de sincronizaciones.
// - MODIFICADO: Se ajusta el tipo de dato de las columnas de tiempo a TIMESTAMP.
// - CORREGIDO: Se hace la función autocontenida para evitar errores de despliegue.
// =====================================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { parseExpression } from 'https://esm.sh/cron-parser@4.9.0';

// Se definen los CORS headers directamente para eliminar la dependencia externa.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CLICKUP_TO_POSTGRE_TYPE_MAP = {
  'text': 'TEXT', 'string': 'TEXT', 'short_text': 'TEXT', 'url': 'TEXT',
  'email': 'VARCHAR(255)', 'phone': 'VARCHAR(255)', 'drop_down': 'VARCHAR(255)',
  'number': 'NUMERIC', 'money': 'NUMERIC', 'date': 'TIMESTAMPTZ', 'checkbox': 'BOOLEAN',
  'users': 'JSONB', 'labels': 'JSONB'
};

const generateTableName = (syncName)=>{
  const sanitized = syncName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  return `sync_${sanitized.slice(0, 50)}`;
};

Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') return new Response(null, {
    status: 204,
    headers: corsHeaders
  });

  let syncId;
  try {
    const { syncConfig, mappings, schedule, mode } = await req.json();
    const { sync_type, time_entries_settings } = syncConfig;
    if (!syncConfig || !sync_type) throw new Error('syncConfig and sync_type are required.');

    const adminClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    const { data: { user }, error: userError } = await createClient(
      Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
    ).auth.getUser();

    if (userError || !user) throw new Error(`Authentication error: ${userError?.message || 'User not found'}`);
    
    const tableName = generateTableName(syncConfig.name);
    let columnsSql = '';

    if (sync_type === 'tasks') {
      if (!mappings || !Array.isArray(mappings.fields)) throw new Error("Mappings are required for 'tasks' sync type.");
      columnsSql = `clickup_task_id TEXT PRIMARY KEY, clickup_list_id TEXT, clickup_folder_id TEXT, clickup_space_id TEXT,\n`;
      mappings.fields.forEach((field)=>{
        const columnName = field.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const columnType = CLICKUP_TO_POSTGRE_TYPE_MAP[field.type] || 'TEXT';
        columnsSql += `  "${columnName}" ${columnType},\n`;
      });
      columnsSql += `last_synced_at TIMESTAMPTZ DEFAULT NOW()`;
    } else if (sync_type === 'time_entries') {
      columnsSql = `
            id TEXT PRIMARY KEY, task_id TEXT, task_name TEXT, user_id BIGINT, user_name TEXT,
            start_time TIMESTAMP, end_time TIMESTAMP, duration BIGINT,
            list_id TEXT, folder_id TEXT, last_synced_at TIMESTAMPTZ DEFAULT NOW()
        `;
    } else {
      throw new Error(`Unsupported sync_type: ${sync_type}`);
    }

    const createTableSql = `CREATE TABLE IF NOT EXISTS clickup_data."${tableName}" (${columnsSql});`;
    const { error: createTableError } = await adminClient.rpc('execute_unrestricted_sql', { sql_command: createTableSql });
    if (createTableError) throw new Error(`No se pudo crear la tabla de destino: ${createTableError.message}`);

    const grantSql = `GRANT ALL ON TABLE clickup_data."${tableName}" TO service_role;`;
    const { error: grantError } = await adminClient.rpc('execute_unrestricted_sql', { sql_command: grantSql });
    if (grantError) throw new Error(`No se pudieron otorgar permisos a la tabla: ${grantError.message}`);

    const clickupAdminClient = createClient(
      Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
      { db: { schema: 'clickup' } }
    );

    let nextRunAt = null;
    if (syncConfig.cron_schedule) {
      try {
        nextRunAt = parseExpression(syncConfig.cron_schedule).next().toISOString();
      } catch (err) {
        console.error(`[Sync Setup] Invalid cron schedule: ${err.message}`);
      }
    }

    const insertPayload = {
      name: syncConfig.name, sync_type: sync_type,
      clickup_workspace_id: syncConfig.workspace, clickup_space_id: syncConfig.space,
      clickup_workspace_name: syncConfig.workspaceName, clickup_space_name: syncConfig.spaceName,
      target_schema: 'clickup_data', target_table: tableName,
      status: 'queued', is_active: true, cron_schedule: syncConfig.cron_schedule || null,
      config: { schedule, mode, ...(sync_type === 'tasks' && { mappings }) },
      user_id: user.id, next_run_at: nextRunAt
    };

    if (sync_type === 'time_entries' && time_entries_settings) {
      insertPayload.time_sync_initial_history_load = time_entries_settings.initial_history_load;
      insertPayload.time_sync_scope = time_entries_settings.sync_scope;
      insertPayload.time_sync_custom_start_date = time_entries_settings.custom_start_date;
      insertPayload.time_sync_custom_end_date = time_entries_settings.custom_end_date;
    }

    const { data: insertedData, error: insertError } = await clickupAdminClient.from('sync_configs').insert(insertPayload).select('id').single();
    if (insertError) throw new Error(`DB Insert Error (sync_configs): ${insertError.message}`);
    
    syncId = insertedData.id;
    const functionToInvoke = sync_type === 'tasks' ? 'import-clickup-full-be' : 'import-time-entries-prod';

    if (insertPayload.cron_schedule) {
      const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/${functionToInvoke}`;
      const cronPayload = JSON.stringify({ sync_id: syncId });
      const cronHeaders = JSON.stringify({
        "Authorization": `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        "Content-Type": "application/json"
      });
      const cronCommand = `SELECT cron.schedule('sync-job-${syncId}', '${insertPayload.cron_schedule}', $$ SELECT net.http_post(url:='${functionUrl}', body:='${cronPayload}'::jsonb, headers:='${cronHeaders}'::jsonb) $$)`;
      await adminClient.rpc('execute_unrestricted_sql', { sql_command: cronCommand });
    }

    const { data: invokeData, error: invokeError } = await adminClient.functions.invoke(functionToInvoke, { body: { sync_id: syncId } });
    if (invokeError) throw new Error(`Failed to invoke sync function: ${invokeError.message}`);

    return new Response(JSON.stringify({
      tableName: `clickup_data.${tableName}`, syncId: syncId, initialInvokeResponse: invokeData
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    if (syncId) {
      try {
        const updateClient = createClient(
          Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
          { db: { schema: 'clickup' } }
        );
        await updateClient.from('sync_configs').update({
          last_run_at: new Date().toISOString(), last_run_status: 'failed', last_run_error: error.message
        }).eq('id', syncId);
      } catch (dbError) {
        console.error(`[Sync Setup] Failed to update sync status to 'failed' for ${syncId}:`, dbError);
      }
    }
    return new Response(JSON.stringify({ error: 'An internal error occurred.', details: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});