// =====================================================================================
// Supabase Edge Function: cleanup-cron-jobs (MODO LECTURA - AUTOCONTENIDO)
// v2: CORRECCIÓN DEL NOMBRE DE LA FUNCIÓN RPC
// OBJETIVO:
// - Se corrigió el nombre de la función RPC a 'execute_unrestricted_sql'.
// - Listar todos los cron jobs existentes en la base de datos sin modificar nada.
// =====================================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Variables de entorno de Supabase no configuradas.');
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log("Listando cron jobs existentes...");
    
    // ========================== INICIO DE LA CORRECCIÓN ==========================
    // Se cambia 'execute_sql_unrestricted' por 'execute_unrestricted_sql'.
    const { data: jobsQueryResult, error: listError } = await adminClient
      .rpc('execute_unrestricted_sql', { sql_command: `SELECT jobid::text, schedule, command FROM cron.job;` });
    // =========================== FIN DE LA CORRECCIÓN ============================

    if (listError) {
        throw new Error(`Error al listar los cron jobs: ${listError.message}`);
    }
    
    const jobList = JSON.parse(jobsQueryResult || '[]');
    const message = `Se encontraron ${jobList.length} cron jobs.`;
    console.log(message);
    console.log("Jobs:", jobList);

    return new Response(JSON.stringify({ 
        success: true, 
        message, 
        jobs_found: jobList 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(`Error en la función cleanup-cron-jobs: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});