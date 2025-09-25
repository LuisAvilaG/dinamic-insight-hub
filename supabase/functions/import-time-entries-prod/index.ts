// =====================================================================================
// Supabase Edge Function: import-time-entries-prod
// OBJETIVO:
// - Sincroniza registros de tiempo desde ClickUp a una tabla de Supabase.
// - Mantiene la lógica original (chunks semanales con fallback diario).
// - Conserva únicamente los campos nuevos en el upsert.
// - MODIFICADO: Convierte las fechas a UTC-6 ('America/Mexico_City') de forma manual
//   para evitar errores de dependencias externas.
// =====================================================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { sub, addDays } from 'https://esm.sh/date-fns@2.30.0';

const CLICKUP_API_BASE_URL = 'https://api.clickup.com/api/v2';
const BATCH_SIZE = 500; // upserts por lote
const REQUEST_DELAY = 200; // ms entre requests

// ========================== INICIO DE LA MODIFICACIÓN ==========================
// 1. Definir el desfase de UTC-6 en milisegundos.
const UTC_OFFSET_MS = 6 * 60 * 60 * 1000;
// =========================== FIN DE LA MODIFICACIÓN ============================

const sleep = (ms)=>new Promise((resolve)=>setTimeout(resolve, ms));
Deno.serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    });
  }
  let syncId = null;
  try {
    const { sync_id } = await req.json();
    syncId = sync_id;
    if (!syncId) throw new Error('sync_id es requerido');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Faltan variables de entorno de Supabase');
    }
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      db: {
        schema: 'clickup'
      }
    });
    // 1) Cargar configuración
    const { data: syncConfig, error: configError } = await adminClient.from('sync_configs').select('*').eq('id', syncId).single();
    if (configError || !syncConfig) {
      throw new Error(`No se pudo cargar sync_config: ${configError?.message}`);
    }
    const { clickup_workspace_id: teamId, target_table, mode, time_sync_initial_history_load, time_sync_scope, time_sync_custom_start_date, time_sync_custom_end_date, last_clickup_time_entry_processed_at, user_id, time_sync_history_loaded } = syncConfig;
    // 2) Token de ClickUp
    const { data: userTokenData, error: tokenError } = await adminClient.from('user_clickup_tokens').select('api_token').eq('user_id', user_id).single();
    if (tokenError || !userTokenData?.api_token) {
      throw new Error(`No se encontró token de ClickUp para el usuario ${user_id}`);
    }
    const clickupToken = userTokenData.api_token;
    // 3) Miembros del workspace
    let allTeamMemberIds = [];
    try {
      const teamMembersApiUrl = `${CLICKUP_API_BASE_URL}/team/${teamId}`;
      const resp = await fetch(teamMembersApiUrl, {
        headers: {
          Authorization: clickupToken,
          'Content-Type': 'application/json'
        }
      });
      if (!resp.ok) throw new Error(`Team members fetch failed: ${resp.status} ${await resp.text()}`);
      const { team } = await resp.json();
      allTeamMemberIds = team?.members?.map((m)=>m?.user?.id?.toString()).filter(Boolean) ?? [];
    } catch (err) {
      throw new Error(`Fallo al obtener miembros del equipo: ${err.message}`);
    }
    // 4) Rango de fechas principal
    let apiStartDate = null;
    let apiEndDate = new Date();
    if (time_sync_initial_history_load && !time_sync_history_loaded) {
      apiStartDate = new Date('2000-01-01T00:00:00Z');
    } else {
      if (time_sync_scope === 'last_week') {
        apiStartDate = sub(apiEndDate, {
          days: 7
        });
      } else if (time_sync_scope === 'last_30_days') {
        apiStartDate = sub(apiEndDate, {
          days: 30
        });
      } else if (time_sync_scope === 'custom_range') {
        if (!time_sync_custom_start_date || !time_sync_custom_end_date) {
          throw new Error('El rango personalizado requiere fecha de inicio y fin');
        }
        apiStartDate = new Date(time_sync_custom_start_date);
        apiEndDate = new Date(time_sync_custom_end_date);
      } else {
        throw new Error(`Scope no soportado: ${time_sync_scope}`);
      }
      if (mode === 'incremental' && last_clickup_time_entry_processed_at) {
        const lastProcessed = new Date(last_clickup_time_entry_processed_at);
        if (apiStartDate.getTime() < lastProcessed.getTime()) {
          apiStartDate = lastProcessed;
        }
      }
    }
    if (!apiStartDate) throw new Error('No se pudo determinar fecha de inicio');
    // 5) Construir chunks
    const buildChunks = (start, end, days)=>{
      const chunks = [];
      let cursor = new Date(start);
      while(cursor < end){
        const chunkEnd = addDays(cursor, days);
        chunks.push({
          start: new Date(cursor),
          end: chunkEnd < end ? chunkEnd : new Date(end)
        });
        cursor = chunkEnd;
      }
      return chunks;
    };
    const weekChunks = buildChunks(apiStartDate, apiEndDate, 7);
    // 6) Fetch de entradas por usuario y semana, con fallback diario si es muy grande
    let allTimeEntries = [];
    for (const memberId of allTeamMemberIds){
      if (!memberId) continue;
      for (const [i, chunk] of weekChunks.entries()){
        try {
          const startMs = chunk.start.getTime();
          const endMs = chunk.end.getTime();
          const url = new URL(`${CLICKUP_API_BASE_URL}/team/${teamId}/time_entries`);
          url.searchParams.append('start_date', startMs.toString());
          url.searchParams.append('end_date', endMs.toString());
          url.searchParams.append('assignee', memberId);
          const resp = await fetch(url.toString(), {
            headers: {
              Authorization: clickupToken
            }
          });
          if (!resp.ok) {
            continue;
          }
          const json = await resp.json();
          const entries = json?.data || [];
          // Fallback a chunks diarios si el semanal es demasiado grande
          if (entries.length >= 5000) {
            const dayChunks = buildChunks(chunk.start, chunk.end, 1);
            for (const day of dayChunks){
              const dUrl = new URL(`${CLICKUP_API_BASE_URL}/team/${teamId}/time_entries`);
              dUrl.searchParams.append('start_date', day.start.getTime().toString());
              dUrl.searchParams.append('end_date', day.end.getTime().toString());
              dUrl.searchParams.append('assignee', memberId);
              const dResp = await fetch(dUrl.toString(), {
                headers: {
                  Authorization: clickupToken
                }
              });
              if (!dResp.ok) continue;
              const dJson = await dResp.json();
              const dEntries = dJson?.data || [];
              allTimeEntries.push(...dEntries);
            }
          } else {
            allTimeEntries.push(...entries);
          }
          await sleep(REQUEST_DELAY);
        } catch  {
        // continuar con el siguiente chunk/usuario
        }
      }
    }
    // 7) Upsert a la tabla destino (solo campos nuevos)
    const supabaseTargetClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      db: {
        schema: 'clickup_data'
      }
    });
    if (allTimeEntries.length > 0) {
      for(let i = 0; i < allTimeEntries.length; i += BATCH_SIZE){
        const batch = allTimeEntries.slice(i, i + BATCH_SIZE);
        const records = batch.map((entry)=>{
          try {
            // ========================== INICIO DE LA MODIFICACIÓN ==========================
            // 2. Función auxiliar para convertir y formatear la fecha
            const toLocalTimestamp = (unixMs) => {
              if (!unixMs) return null;
              // Crear fecha UTC a partir del timestamp
              const utcDate = new Date(parseInt(unixMs));
              // Aplicar el desfase para obtener la hora local
              const localDate = new Date(utcDate.getTime() - UTC_OFFSET_MS);
              // Formatear como 'YYYY-MM-DDTHH:mm:ss', que es lo que espera la columna TIMESTAMP
              return localDate.toISOString().slice(0, 19).replace('T', ' ');
            };

            return {
              id: entry?.id,
              task_id: entry?.task?.id ?? null,
              task_name: entry?.task?.name ?? null,
              user_id: entry?.user?.id ?? null,
              user_name: entry?.user?.username ?? null,
              start_time: toLocalTimestamp(entry.start),
              end_time: toLocalTimestamp(entry.end),
              duration: entry?.duration ? parseInt(entry.duration) : null,
              list_id: entry?.task_location?.list_id ?? null,
              folder_id: entry?.task_location?.folder_id ?? null
            };
            // =========================== FIN DE LA MODIFICACIÓN ============================
          } catch  {
            return null;
          }
        }).filter(Boolean);
        const { error: upsertError } = await supabaseTargetClient.from(target_table).upsert(records, {
          onConflict: 'id'
        });
        if (upsertError) {
          throw new Error(`Fallo el upsert: ${upsertError.message}`);
        }
      }
    }
    // 8) Actualizar estado de la sync
    const updatePayload = {
      last_run_at: new Date().toISOString(),
      last_run_status: 'succeeded'
    };
    if (time_sync_initial_history_load && !time_sync_history_loaded) {
      updatePayload.time_sync_history_loaded = true;
    }
    const { error: updateError } = await adminClient.from('sync_configs').update(updatePayload).eq('id', syncId);
    if (updateError) throw new Error(`No se pudo actualizar sync_configs: ${updateError.message}`);
    return new Response(JSON.stringify({
      status: 'succeeded',
      entries_processed: allTimeEntries.length
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    console.error(`[Sync ID: ${syncId || 'N/A'}] Error: ${error.message}`);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});