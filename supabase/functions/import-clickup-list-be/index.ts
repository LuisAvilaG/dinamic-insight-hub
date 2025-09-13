
// =====================================================================================
// Supabase Edge Function: import-clickup-list-be (Worker)
// v3: Lógica de parámetros dinámicos para `include_closed` y `subtasks`.
// OBJETIVO: Este trabajador es invocado por el orquestador. Construye la URL de la API
//          de ClickUp de forma dinámica según el tipo de lista que procesa para incluir
//          o no tareas cerradas y subtareas.
// =====================================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const schema = {
  "database_schema_blueprint": {
    "tasks_project_information": {
      "source_list_pattern": "Project Information",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "Nombre de tarea", "requires_clickup_id": false },
        { "column_name": "custom_Project_Manager", "data_type": "TEXT", "source_field": "Project Manager", "requires_clickup_id": true, "clickup_id": "ae2c28e4-f1e1-4725-8975-cc2e7d285ada" },
        { "column_name": "custom_fase_del_proyecto", "data_type": "TEXT", "source_field": "Fase del proyecto", "requires_clickup_id": true, "clickup_id": "23a57a9f-46a9-41d2-9051-e16ea69d38c7" },
        { "column_name": "custom_fecha_de_kick_off", "data_type": "TIMESTAMPTZ", "source_field": "Fecha de Kick Off", "requires_clickup_id": true, "clickup_id": "91aeacc8-8050-4ada-8dba-f1ed2433f711" },
        { "column_name": "custom_fecha_planeada_go_live", "data_type": "TIMESTAMPTZ", "source_field": "Fecha Planeada de Go live", "requires_clickup_id": true, "clickup_id": "0022fdf8-df3c-4b6d-bebe-6fe6aaa27c89" },
        { "column_name": "custom_horas_contratadas", "data_type": "NUMERIC", "source_field": "Horas Contratadas", "requires_clickup_id": true, "clickup_id": "21b54a34-6adf-4961-869a-2d04a7bbad68" },
        { "column_name": "custom_horas_proyecto", "data_type": "NUMERIC", "source_field": "Horas Proyecto", "requires_clickup_id": true, "clickup_id": "07487b45-b485-41e0-a8de-eb1f7344d108" },
        { "column_name": "custom_horas_integraciones_o_desarrollos", "data_type": "NUMERIC", "source_field": "Horas integraciones o desarrollos", "requires_clickup_id": true, "clickup_id": "7e42f887-b7ee-4c5c-8586-8e2ea15cf8df" },
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false }
      ]
    },
    "tasks_action_items": {
      "source_list_pattern": "Action Items",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "Task name", "requires_clickup_id": false },
        { "column_name": "status", "data_type": "TEXT", "source_field": "Status", "requires_clickup_id": false },
        { "column_name": "custom_Responsable", "data_type": "TEXT", "source_field": "Responsable", "requires_clickup_id": true, "clickup_id": "2713ac2e-844e-476b-bc84-81ade8059f99" },
        { "column_name": "priority", "data_type": "TEXT", "source_field": "Priority", "requires_clickup_id": false },
        { "column_name": "start_date", "data_type": "TIMESTAMPTZ", "source_field": "Start date", "requires_clickup_id": false },
        { "column_name": "due_date", "data_type": "TIMESTAMPTZ", "source_field": "Due date", "requires_clickup_id": false },
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false }
      ]
    },
    "tasks_gaps": {
      "source_list_pattern": "Gaps",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "Gap name", "requires_clickup_id": false },
        { "column_name": "status", "data_type": "TEXT", "source_field": "Status", "requires_clickup_id": false },
        { "column_name": "custom_Gap_Estatus", "data_type": "TEXT", "source_field": "Gap Estatus", "requires_clickup_id": true, "clickup_id": "6240f422-641f-4613-8f39-2c34bde6fc2f" },
        { "column_name": "priority", "data_type": "TEXT", "source_field": "Priority", "requires_clickup_id": false },
        { "column_name": "custom_detalles", "data_type": "TEXT", "source_field": "Detalles", "requires_clickup_id": true, "clickup_id": "867c831b-eb0e-46bf-8db8-7e8602d74013" },
        { "column_name": "custom_fecha_de_identificacion", "data_type": "TIMESTAMPTZ", "source_field": "Fecha de identificación", "requires_clickup_id": true, "clickup_id": "14da4d10-9a16-4192-aaea-f58d4784e59c" },
        { "column_name": "custom_hrs_estimadas", "data_type": "NUMERIC", "source_field": "Hrs Estimadas", "requires_clickup_id": true, "clickup_id": "fbc3e4e3-8341-4de7-aec0-70b6c71fb81b" },
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false }
      ]
    },
    "tasks_risks_issues": {
      "source_list_pattern": "Riesgos - Issues",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "Risk or issue name", "requires_clickup_id": false },
        { "column_name": "custom_Responsable", "data_type": "TEXT", "source_field": "Responsable", "requires_clickup_id": true, "clickup_id": "f97912ce-48ab-4f49-a698-07ca979ef61a" },
        { "column_name": "priority", "data_type": "TEXT", "source_field": "Priority", "requires_clickup_id": false },
        { "column_name": "status", "data_type": "TEXT", "source_field": "Estatus", "requires_clickup_id": false },
        { "column_name": "custom_Estatus", "data_type": "TEXT", "source_field": "Estatus", "requires_clickup_id": true, "clickup_id": "ec09a5a8-bac0-4f8e-aa48-fe2f1ee7d98b" },
        { "column_name": "custom_action_plan", "data_type": "TEXT", "source_field": "Action Plan", "requires_clickup_id": true, "clickup_id": "11104917-b1e7-47d9-b47d-a6fcf56fb7f7" },
        { "column_name": "custom_fecha_de_reporte", "data_type": "TIMESTAMPTZ", "source_field": "Fecha de reporte", "requires_clickup_id": true, "clickup_id": "d8d5e640-4c71-46a9-92dc-00d092ff0b8c" },
        { "column_name": "custom_tipo", "data_type": "TEXT", "source_field": "Tipo", "requires_clickup_id": true, "clickup_id": "feb4d279-c7c1-479f-8df3-a2d95bce79e1" },
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false }
      ]
    },
    "tasks_documents": {
      "source_list_pattern": "Documentos",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "Document name", "requires_clickup_id": false },
        { "column_name": "status", "data_type": "TEXT", "source_field": "Status", "requires_clickup_id": false },
        { "column_name": "custom_Documento", "data_type": "TEXT", "source_field": "Documento", "requires_clickup_id": true, "clickup_id": "b723726c-fbe1-4c31-b8cb-796055c1bb4e" },
        { "column_name": "custom_Estatus", "data_type": "TEXT", "source_field": "Estatus", "requires_clickup_id": true, "clickup_id": "0393f812-1ee0-417b-bbe6-91dc57d0888b" },
        { "column_name": "custom_fase_del_proyecto", "data_type": "TEXT", "source_field": "Fase del proyecto", "requires_clickup_id": true, "clickup_id": "41ab98a2-cf3f-45da-98ae-326e022debf8" },
        { "column_name": "custom_fecha_de_firma_cierre", "data_type": "TIMESTAMPTZ", "source_field": "Fecha de firma - Cierre", "requires_clickup_id": true, "clickup_id": "b971a43d-4352-40b3-a32b-ba0b92f1b116" },
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false }
      ]
    },
    "tasks_orders_of_change": {
      "source_list_pattern": "Ordenes de Cambio",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "ODC name", "requires_clickup_id": false },
        { "column_name": "priority", "data_type": "TEXT", "source_field": "Priority", "requires_clickup_id": false },
        { "column_name": "status", "data_type": "TEXT", "source_field": "Status", "requires_clickup_id": false },
        { "column_name": "custom_Impacto", "data_type": "TEXT", "source_field": "Impacto", "requires_clickup_id": true, "clickup_id": "9caaff7c-e0b0-4e82-aaf7-3efb68d08ba3" },
        { "column_name": "custom_Estatus", "data_type": "TEXT", "source_field": "Estatus", "requires_clickup_id": true, "clickup_id": "ff1d2ed1-04ff-4dd6-8318-9be600cdf126" },
        { "column_name": "custom_costo", "data_type": "NUMERIC", "source_field": "Costo", "requires_clickup_id": true, "clickup_id": "e8faae3f-2abd-487f-9d08-2907b4abc798" },
        { "column_name": "custom_fecha_de_firma", "data_type": "TIMESTAMPTZ", "source_field": "Fecha de firma", "requires_clickup_id": true, "clickup_id": "eaa1f26c-69cd-4d16-9348-e714cc846583" },
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false }
      ]
    },
    "tasks_project_plan": {
      "source_list_pattern": "Project Plan",
      "columns": [
        { "column_name": "clickup_task_id", "data_type": "TEXT", "is_primary_key": true, "source_field": "id", "requires_clickup_id": false },
        { "column_name": "clickup_list_id", "data_type": "TEXT", "source_field": "list.id", "requires_clickup_id": false },
        { "column_name": "clickup_list_name", "data_type": "TEXT", "source_field": "list.name", "requires_clickup_id": false },
        { "column_name": "clickup_folder_id", "data_type": "TEXT", "source_field": "folder.id", "requires_clickup_id": false },
        { "column_name": "clickup_folder_name", "data_type": "TEXT", "source_field": "folder.name", "requires_clickup_id": false },
        { "column_name": "name", "data_type": "TEXT", "source_field": "Task name", "requires_clickup_id": false },
        { "column_name": "status", "data_type": "TEXT", "source_field": "Status", "requires_clickup_id": false },
        { "column_name": "assignees", "data_type": "TEXT[]", "source_field": "Persona asignada", "requires_clickup_id": false },
        { "column_name": "start_date", "data_type": "TIMESTAMPTZ", "source_field": "Start date", "requires_clickup_id": false },
        { "column_name": "due_date", "data_type": "TIMESTAMPTZ", "source_field": "Due date", "requires_clickup_id": false },
        { "column_name": "time_spent", "data_type": "NUMERIC", "source_field": "time_spent", "requires_clickup_id": false },
        { "column_name": "time_estimate", "data_type": "NUMERIC", "source_field": "time_estimate", "requires_clickup_id": false},
        { "column_name": "last_synced_at", "data_type": "TIMESTAMPTZ", "source_field": "system", "requires_clickup_id": false },
        { "column_name": "is_subtask", "data_type": "BOOLEAN", "source_field": "system", "requires_clickup_id": false },
        { "column_name": "parent_task_id", "data_type": "TEXT", "source_field": "system", "requires_clickup_id": false }
      ]
    }
  }
};

type ClickUpTask = { id: string; name: string; status: { status: string }; priority: any; start_date: string | null; due_date: string | null; time_estimate: number; time_spent: number; parent: string | null; assignees: { id: string, username: string }[]; custom_fields: ClickUpCustomField[]; list: { id: string, name: string }; folder: { id: string, name: string }; };
type ClickUpCustomField = { id: string; name: string; type: string; value: any; type_config?: { options?: { name: string, orderindex: number }[] } };

const CUSTOM_FIELD_MAP: { [key: string]: { column: string; type: string } } = {};
const LIST_TYPE_MAP: { [key: string]: { rpc: string; table: string; columns: { column_name: string, source_field: string }[] } } = {};

for (const [tableName, tableDef] of Object.entries(schema.database_schema_blueprint)) {
    LIST_TYPE_MAP[tableDef.source_list_pattern] = {
        rpc: `upsert_${tableName}`,
        table: tableName,
        columns: tableDef.columns
    };
    for (const col of tableDef.columns) {
        if (col.requires_clickup_id) {
            CUSTOM_FIELD_MAP[col.clickup_id] = { column: col.column_name, type: col.data_type };
        }
    }
}

function getListInfo(listName: string) {
    for (const key in LIST_TYPE_MAP) {
        if (listName.trim().toLowerCase().startsWith(key.toLowerCase())) return { type: key, ...LIST_TYPE_MAP[key] };
    }
    return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const { list_id, folder_name, list_name } = await req.json();

  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { db: { schema: 'be_exponential' } });
  
  try {
    if (!list_id || !list_name || !folder_name) throw new Error("Missing list_id, list_name, or folder_name in request body");

    const clickUpToken = Deno.env.get('CLICKUP_API_TOKEN');
    const clickupHeaders = { 'Authorization': clickUpToken };

    const listInfo = getListInfo(list_name);
    if (!listInfo) {
      throw new Error(`No matching schema found for list '${list_name}'. Cannot process.`);
    }

    let page = 0, hasMore = true, totalTasksProcessed = 0;
    while(hasMore) {
        let baseUrl = `https://api.clickup.com/api/v2/list/${list_id}/task?page=${page}`;
        const params = new URLSearchParams();

        // Lógica de parámetros dinámicos
        if (listInfo.type === 'Project Plan') {
            params.append('subtasks', 'true');
            params.append('include_closed', 'true');
        } else if (listInfo.type !== 'Action Items') {
            params.append('include_closed', 'true');
        }
        
        const tasksUrl = `${baseUrl}&${params.toString()}`;
        const tasksRes = await fetch(tasksUrl, { headers: clickupHeaders });
        if (!tasksRes.ok) throw new Error(`ClickUp API error while fetching tasks: ${await tasksRes.text()}`);
        
        const { tasks, last_page } = await tasksRes.json();
        hasMore = !last_page; page++;

        if (tasks.length === 0) continue;

        const transformedTasks = tasks.map((task: ClickUpTask) => {
            const record: { [key: string]: any } = {};
            listInfo.columns.forEach(c => record[c.column_name] = null);

            record.clickup_task_id = task.id;
            record.clickup_list_id = list_id;
            record.clickup_list_name = list_name;
            record.clickup_folder_name = folder_name;
            if ('folder' in record && task.folder) record.clickup_folder_id = task.folder.id;
            if ('name' in record) record.name = task.name;
            if ('status' in record) record.status = task.status.status;
            if ('priority' in record) record.priority = task.priority?.priority;
            if ('assignees' in record) record.assignees = task.assignees?.map(a => a.username) || [];
            if ('start_date' in record) record.start_date = task.start_date ? new Date(parseInt(task.start_date)).toISOString() : null;
            if ('due_date' in record) record.due_date = task.due_date ? new Date(parseInt(task.due_date)).toISOString() : null;
            if ('time_estimate' in record) record.time_estimate = task.time_estimate || 0;
            if ('time_spent' in record) record.time_spent = task.time_spent || 0;
            if ('is_subtask' in record) record.is_subtask = !!task.parent;
            if ('parent_task_id' in record) record.parent_task_id = task.parent;
            record.last_synced_at = new Date().toISOString();

            if (task.custom_fields) {
              for (const field of task.custom_fields) {
                const mapping = CUSTOM_FIELD_MAP[field.id];
                if (mapping && field.value !== undefined && field.value !== null) {
                  let parsedValue: any = null;
                  try {
                    switch (field.type) {
                        case 'drop_down':
                            const selectedOption = field.type_config?.options?.find(opt => opt.orderindex == field.value);
                            parsedValue = selectedOption ? selectedOption.name : null;
                            break;
                        case 'users':
                            parsedValue = Array.isArray(field.value) ? field.value.map(u => u.username).join(', ') : null;
                            break;
                        case 'date':
                            parsedValue = new Date(parseInt(field.value)).toISOString();
                            break;
                        case 'number':
                            parsedValue = Number(field.value);
                            break;
                        default:
                            parsedValue = Array.isArray(field.value) ? field.value.join(', ') : String(field.value);
                            break;
                    }
                    record[mapping.column] = parsedValue;
                  } catch (e) { console.warn(`Could not parse field '${field.name}' (ID: ${field.id}). Error: ${e.message}`); }
                }
              }
            }
            return record;
        });

        const { error } = await supabase.rpc(listInfo.rpc, { tasks_data: transformedTasks });
        if (error) throw new Error(`Supabase RPC error in ${listInfo.rpc}: ${error.message} - ${error.details}`);

        totalTasksProcessed += transformedTasks.length;
    }

    return new Response(JSON.stringify({ message: `Successfully processed ${totalTasksProcessed} tasks for list '${list_name}'` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

  } catch (error) {
    console.error(`Function Error: ${error.message}`);
    return new Response(JSON.stringify({ error: `Worker failed for list ${list_name}: ${error.message}` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 });
  }
})
