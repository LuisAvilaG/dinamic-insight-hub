import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { parseExpression } from 'https://esm.sh/cron-parser@4.9.0';

// =====================================================================================
// VERSIÓN 13 - GUARDAR NOMBRES DE WORKSPACE Y SPACE
// PROPÓSITO:
// 1. Aceptar y guardar `clickup_workspace_name` y `clickup_space_name` en la BBDD
//    para mejorar la visualización en el frontend.
// =====================================================================================

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
  console.log('[setup-sync-tables] Function invoked.', { method: req.method });

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { syncConfig, mappings } = await req.json();
    if (!syncConfig || !mappings) {
      throw new Error('syncConfig and mappings are required in the request body.');
    }
    console.log('[setup-sync-tables] Received payload:', { syncConfig, mappings });

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user }, error: userError } = await authClient.auth.getUser();
    if (userError || !user) throw new Error(`Authentication error: ${userError?.message ?? 'User not found'}`);
    const userId = user.id;
    console.log('[setup-sync-tables] User authenticated successfully.', { userId });

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const tableName = generateTableName(syncConfig.name);
    console.log('[setup-sync-tables] Generated table name:', { tableName });

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
    console.log('[setup-sync-tables] Table creation successful.');

    const clickupAdminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { db: { schema: 'clickup' } }
    );

    let nextRunAt = null;
    if (syncConfig.cron_schedule) {
        try {
            const interval = parseExpression(syncConfig.cron_schedule);
            nextRunAt = interval.next().toISOString();
            console.log(`[setup-sync-tables] Calculated next run at: ${nextRunAt}`);
        } catch (err) {
            console.error(`[setup-sync-tables] Error parsing cron expression: ${err.message}`);
            throw new Error(`Invalid cron schedule format: ${syncConfig.cron_schedule}`);
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
      config: syncConfig.config || null,
      user_id: userId,
      next_run_at: nextRunAt,
    };

    const { data: insertedData, error: insertError } = await clickupAdminClient
      .from('sync_configs')
      .insert(insertPayload)
      .select('id')
      .single();

    if (insertError) {
      console.error('[setup-sync-tables] DB Insert Error into clickup.sync_configs:', insertError);
      throw new Error(`DB Insert Error (clickup.sync_configs): ${insertError.message}`);
    }
    console.log('[setup-sync-tables] Insert into clickup.sync_configs successful.', { insertedData });

    const syncId = insertedData.id;

    if (insertPayload.cron_schedule) {
        const functionUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/import-clickup-full-be`;
        const cronPayload = JSON.stringify({ sync_id: syncId });
        const cronHeaders = JSON.stringify({
          "Authorization": `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          "Content-Type": "application/json"
        });
        const cronCommand = `SELECT cron.schedule('sync-job-${syncId}', '${insertPayload.cron_schedule}', $$ SELECT net.http_post(url:='${functionUrl}', body:='${cronPayload}'::jsonb, headers:='${cronHeaders}'::jsonb) $$)`;
        
        const { error: cronError } = await adminClient.rpc('execute_unrestricted_sql', { sql_command: cronCommand });
        if (cronError) console.error('[setup-sync-tables] CRON Job Scheduling failed:', cronError);
        else console.log('[setup-sync-tables] CRON job scheduled successfully.');
    }

    console.log(`[setup-sync-tables] Invoking initial sync for sync_id: ${syncId}`);
    await clickupAdminClient.from('sync_configs').update({ status: 'running' }).eq('id', syncId);

    const { error: invokeError } = await adminClient.functions.invoke('import-clickup-full-be', {
        body: { sync_id: syncId },
    });

    if (invokeError) {
        console.error(`[setup-sync-tables] Initial sync invocation failed for sync_id: ${syncId}`, invokeError);
        await clickupAdminClient.from('sync_configs').update({ 
            status: 'failed',
            last_run_status: 'error',
            last_run_result: `Initial invocation failed: ${invokeError.message}`
        }).eq('id', syncId);
    } else {
        console.log(`[setup-sync-tables] Initial sync invoked successfully for sync_id: ${syncId}`);
    }

    return new Response(JSON.stringify({ tableName: `clickup_data.${tableName}`, syncId: syncId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[setup-sync-tables] CATCH BLOCK ERROR:', { 
      errorMessage: error.message, 
      errorStack: error.stack,
      fullError: error
    });
    return new Response(JSON.stringify({ error: 'An internal error occurred.', details: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});