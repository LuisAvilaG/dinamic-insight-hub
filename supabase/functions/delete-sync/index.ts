// supabase/functions/delete-sync/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sync_id } = await req.json()
    if (!sync_id) {
      throw new Error('sync_id is required.')
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    
    const clickupAdminClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        { db: { schema: 'clickup' } }
    );

    // 1. Fetch config to get table name
    const { data: config, error: configError } = await clickupAdminClient
      .from('sync_configs')
      .select('target_table')
      .eq('id', sync_id)
      .single()

    if (configError) throw new Error(`Failed to fetch sync config: ${configError.message}`)
    if (!config) throw new Error('Sync configuration not found.')
    
    const tableName = config.target_table;

    // 2. Unschedule cron job
    const cronJobName = `sync-job-${sync_id}`;
    const { error: unscheduleError } = await adminClient.rpc('execute_unrestricted_sql', {
        sql_command: `SELECT cron.unschedule('${cronJobName}');`
    });
    if (unscheduleError) {
        console.warn(`Could not unschedule cron job ${cronJobName}: ${unscheduleError.message}`);
    }

    // 3. Drop data table
    if (tableName) {
        const { error: dropError } = await adminClient.rpc('execute_unrestricted_sql', {
            sql_command: `DROP TABLE IF EXISTS clickup_data."${tableName}";`
        });
        if (dropError) throw new Error(`Failed to drop data table: ${dropError.message}`)
    }

    // 4. Delete the sync configuration
    const { error: deleteError } = await clickupAdminClient
      .from('sync_configs')
      .delete()
      .eq('id', sync_id)

    if (deleteError) throw new Error(`Failed to delete sync config: ${deleteError.message}`)

    return new Response(JSON.stringify({ message: 'Sync deleted successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})