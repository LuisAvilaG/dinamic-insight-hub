// =====================================================================================
// Supabase Edge Function: import-clickup-time-entries (EXTREME MINIMAL VERSION FOR DEBUGGING)
// OBJETIVO: Aislar si el problema es de inicialización del runtime de Deno.
// =====================================================================================

import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Manejar la petición OPTIONS de pre-vuelo
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Para cualquier otra petición (ej. POST), devolver una respuesta simple
  try {
    return new Response(JSON.stringify({ message: 'Time Entries Function: Extreme Minimal Version Running' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Usar 200 OK para confirmar que se ejecutó
    });
  } catch (error) {
    console.error("Error in minimal function:", error);
    return new Response(JSON.stringify({ error: 'Internal Error in Minimal Function' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
