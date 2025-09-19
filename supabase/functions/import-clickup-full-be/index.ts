// =====================================================================================
// Supabase Edge Function: import-clickup-full-be (Orchestrator)
// v11: CORRECCIÓN DE CLIENTE DE BASE DE DATOS PARA INSERCIÓN
// OBJETIVO:
// 1. Utilizar el cliente de Supabase correcto (`clickupDataAdminClient`) que apunta
//    al esquema `clickup_data` al momento de hacer el `upsert`.
// 2. Esto corrige el error que causaba que la función fallara al no encontrar la
//    tabla de destino en el esquema `public`.
// =====================================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const normalizeColName = (name) => name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  let syncId = null;
  let clickupAdminClient;

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      throw new Error("CRITICAL: Missing 'SUPABASE_URL' or 'SUPABASE_SERVICE_ROLE_KEY' environment variables.");
    }

    const { sync_id } = await req.json();
    syncId = sync_id;
    if (!syncId) throw new Error("sync_id is required in the request body.");

    console.log(`[Orchestrator] Starting process for sync_id: ${syncId}`);

    const adminClient = createClient(supabaseUrl, serviceKey);
    clickupAdminClient = createClient(supabaseUrl, serviceKey, { db: { schema: 'clickup' } });
    const clickupDataAdminClient = createClient(supabaseUrl, serviceKey, { db: { schema: 'clickup_data' } });

    console.log(`[Orchestrator] Fetching sync config...`);
    const { data: config, error: configError } = await clickupAdminClient
      .from('sync_configs')
      .select('id, user_id, clickup_space_id, target_table, config')
      .eq('id', syncId)
      .single();

    if (configError || !config) throw new Error(`Failed to fetch sync config: ${configError?.message || 'Not found'}`);
    
    await clickupAdminClient.from('sync_configs').update({
      status: 'running',
      last_run_at: new Date().toISOString()
    }).eq('id', syncId);

    if (!config.config?.mappings?.templates || config.config.mappings.templates.length === 0) {
      throw new Error("Mapping templates are missing or empty in the sync configuration.");
    }
    const templates = config.config.mappings.templates;
    const allFields = config.config.mappings.fields || [];

    console.log(`[Orchestrator] Fetching user token...`);
    const { data: tokenData, error: tokenError } = await clickupAdminClient.from('user_clickup_tokens').select('api_token').eq('user_id', config.user_id).single();
    if (tokenError || !tokenData?.api_token) throw new Error(`Token not found for user ${config.user_id}: ${tokenError?.message}`);
    const clickUpToken = tokenData.api_token;
    const clickupHeaders = { 'Authorization': clickUpToken };

    if (config.config?.mode === 'full') {
      console.log(`[Orchestrator] Full Sync mode detected. Truncating table: clickup_data.${config.target_table}`);
      await adminClient.rpc('execute_unrestricted_sql', { sql_command: `TRUNCATE TABLE clickup_data."${config.target_table}" RESTART IDENTITY;` });
    }

    const allRowsToInsert = [];
    let totalListsProcessed = 0;

    const listIdsToProcess = new Set();
    templates.forEach(template => {
        template.list_ids.forEach(listId => listIdsToProcess.add(listId));
    });
    
    totalListsProcessed = listIdsToProcess.size;
    console.log(`[Orchestrator] Processing tasks from ${totalListsProcessed} unique lists defined in templates.`);

    for (const listId of listIdsToProcess) {
      const tasksRes = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task?include_subtasks=true`, { headers: clickupHeaders });
      if (tasksRes.ok) {
        const { tasks } = await tasksRes.json();
        for (const task of tasks) {
          const row = {
            clickup_task_id: task.id,
            clickup_list_id: listId,
            clickup_folder_id: task.folder?.id,
            clickup_space_id: task.space?.id
          };

          for (const field of allFields) {
            const colName = normalizeColName(field.name);
            let value = null;
            if (task[field.name] !== undefined) {
                value = task[field.name];
            } 
            else if (task.custom_fields) {
              const customField = task.custom_fields.find((cf) => cf.id === field.id);
              if (customField && customField.value !== undefined) {
                value = customField.value;
              }
            }
            row[colName] = value;
          }
          allRowsToInsert.push(row);
        }
      } else {
        console.warn(`[Orchestrator] Failed to fetch tasks for list ${listId}. Status: ${tasksRes.status}`);
      }
    }

    if (allRowsToInsert.length > 0) {
      const BATCH_SIZE = 200;
      for (let i = 0; i < allRowsToInsert.length; i += BATCH_SIZE) {
        const batch = allRowsToInsert.slice(i, i + BATCH_SIZE);
        // --- CORRECCIÓN AQUÍ ---
        const { error: upsertError } = await clickupDataAdminClient.from(config.target_table).upsert(batch, { onConflict: 'clickup_task_id' });
        // --- FIN DE LA CORRECCIÓN ---
        if (upsertError) throw new Error(`Failed to upsert batch: ${upsertError.message}`);
      }
    }

    const successMessage = `Successfully processed ${allRowsToInsert.length} tasks from ${totalListsProcessed} lists.`;
    await clickupAdminClient.from('sync_configs').update({
      status: 'active',
      last_run_status: 'success',
      last_run_result: successMessage
    }).eq('id', syncId);

    return new Response(JSON.stringify({ message: "Orchestration complete." }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    console.error(`[Orchestrator] CATCH BLOCK ERROR for sync_id: ${syncId}:`, error.message);
    if (syncId && clickupAdminClient) {
      await clickupAdminClient.from('sync_configs').update({
        status: 'failed',
        last_run_status: 'error',
        last_run_result: error.message
      }).eq('id', syncId);
    }
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
});