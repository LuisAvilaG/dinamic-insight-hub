
// =====================================================================================
// Supabase Edge Function: import-clickup-full-be (Orchestrator)
// v12: Lógica de registro minimalista y precisa.
// OBJETIVO: Este orquestador verifica la integridad de las listas por carpeta y delega
//          el procesamiento. SOLO registra errores de listas faltantes o un único
//          mensaje de éxito por carpeta.
// =====================================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const knowledgeBase = {
  "team": {
    "id": "9014362388",
    "name": "BeExponential",
    "main_spaces": [{ "name": "Corporative Projects", "id": "90141611829" }]
  },
  "mandatory_lists": [
    "Project Information", "Action Items", "Gaps", "Riesgos - Issues",
    "Documentos", "Ordenes de Cambio", "Project Plan"
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const clickUpToken = Deno.env.get('CLICKUP_API_TOKEN');

  try {
    if (!clickUpToken || !supabaseUrl || !supabaseServiceKey) throw new Error("Missing environment variables");

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { db: { schema: 'be_exponential' } });
    const clickupHeaders = { 'Authorization': clickUpToken };

    const beSpace = knowledgeBase.team.main_spaces.find(s => s.name === "Corporative Projects");
    if (!beSpace) throw new Error("Space 'Corporative Projects' not found in knowledge base.");

    const foldersRes = await fetch(`https://api.clickup.com/api/v2/space/${beSpace.id}/folder`, { headers: clickupHeaders });
    if (!foldersRes.ok) throw new Error(`Failed to fetch folders: ${await foldersRes.text()}`);
    const { folders } = await foldersRes.json();

    const invocationPromises = [];

    for (const folder of folders) {
      if (folder.archived) continue; // Saltar carpetas archivadas silenciosamente.
      
      const listsRes = await fetch(`https://api.clickup.com/api/v2/folder/${folder.id}/list`, { headers: clickupHeaders });
      if (!listsRes.ok) {
        console.error(`Failed to fetch lists for folder ${folder.name}.`);
        continue; 
      }
      const { lists } = await listsRes.json();

      const foundMandatoryLists = new Set<string>();
      const listMappings = new Map<string, { id: string; name: string }>();

      for (const listFromClickUp of lists) {
        const mandatoryName = knowledgeBase.mandatory_lists.find(mName => 
            listFromClickUp.name.trim().toLowerCase().startsWith(mName.toLowerCase())
        );
        if (mandatoryName) {
            foundMandatoryLists.add(mandatoryName);
            listMappings.set(mandatoryName, { id: listFromClickUp.id, name: listFromClickUp.name });
        }
      }

      const missingLists = knowledgeBase.mandatory_lists.filter(m => !foundMandatoryLists.has(m));
      
      if (missingLists.length === 0) {
        // ÉXITO: Todas las listas encontradas. Un solo log.
        const detailMessage = `Se procesaron ${listMappings.size} listas de la carpeta ${folder.name}`;
        await supabase.rpc('create_log_entry', { p_log_level: 'SUCCESS', p_status: 'Complete', p_details: detailMessage, p_folder_name: folder.name });
      } else {
        // ERROR: Faltan listas. Un log por cada lista faltante.
        for (const missing of missingLists) {
            const detailMessage = `No se encontró la lista ${missing} en la carpeta ${folder.name}`;
            await supabase.rpc('create_log_entry', { p_log_level: 'WARN', p_status: 'Incomplete', p_details: detailMessage, p_folder_name: folder.name});
        }
      }

      // Invocar workers para las listas que SÍ se encontraron.
      for (const [_, listData] of listMappings.entries()) {
        const invokeUrl = `${supabaseUrl}/functions/v1/import-clickup-list-be`;
        const promise = fetch(invokeUrl, {
            method: 'POST',
            headers: { ...corsHeaders, 'Authorization': `Bearer ${supabaseServiceKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              list_id: listData.id, 
              folder_name: folder.name, 
              list_name: listData.name
            })
        });
        invocationPromises.push(promise);
      }
    }
    
    await Promise.race([
        Promise.all(invocationPromises),
        new Promise(resolve => setTimeout(resolve, 5000))
    ]);

    return new Response(JSON.stringify({ message: "Orchestration complete. List processing triggered." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 202 });

  } catch (error) {
    console.error(`Orchestrator failed catastrophically: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
})
