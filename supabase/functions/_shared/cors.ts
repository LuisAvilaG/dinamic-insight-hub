// supabase/functions/_shared/cors.ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS', // Asegúrate de incluir todos los métodos que uses
  'Access-Control-Max-Age': '86400', // Cachea la respuesta de pre-vuelo por 24 horas
};