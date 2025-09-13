
// =====================================================================================
// Supabase Edge Function: get-import-logs (Temporal)
// OBJETIVO: Una función de un solo uso para consultar y devolver el contenido de la
//          tabla `import_logs` para verificar el resultado de la importación.
// =====================================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { db: { schema: 'be_exponential' } }
    );

    const { data, error } = await supabase
      .from('import_logs')
      .select('created_at, folder_name, list_name, status, details')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
