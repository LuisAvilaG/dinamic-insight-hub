-- ==================================================================
-- MIGRACIÓN: Programación de Sincronización Diaria (Cron Job) - v2
-- ==================================================================
-- OBJETIVO: Crear o actualizar un trabajo programado (cron job) que
--          ejecute la función orquestadora `import-clickup-full-be`
--          todos los días a las 2:00 AM (UTC).
-- NOTA: Se elimina `cron.unschedule` ya que `cron.schedule` con un
--       nombre de trabajo gestiona la creación y actualización.
-- ==================================================================

-- PASO 1: Asegurarse de que las extensiones necesarias estén habilitadas.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- PASO 2: Programar (o actualizar) el trabajo.
-- La expresión '0 2 * * *' significa: "A los 0 minutos de la hora 2, todos los días".
-- La tarea ejecuta una petición POST a la función orquestadora.
SELECT cron.schedule(
  'sync-clickup-daily', 
  '0 2 * * *', 
  $$
  SELECT net.http_post(
      url:='https://rytfakmpznrithljllyl.supabase.co/functions/v1/import-clickup-full-be',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjQyODE2MDAsImV4cCI6MTgxNzE0NTYwMH0.Mzk-AmN3rKxc9w24QZ23S3hN3StK0zV5r39M0y_h9is"}'::jsonb,
      body:='{}'::jsonb
  )
  $$
);

