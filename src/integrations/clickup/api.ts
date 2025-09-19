
import { supabase } from '@/integrations/supabase/client';

// Helper function to call the ClickUp proxy Edge Function
const callClickUpProxy = async (apiToken: string, path: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: Record<string, any>) => {
    const { data, error } = await supabase.functions.invoke('clickup-proxy', {
        body: {
            api_token: apiToken,
            clickup_path: path,
            method: method,
            body: body
        }
    });

    if (error) {
        console.error(`Error invoking clickup-proxy for path ${path}:`, error);
        throw new Error(`Proxy function invocation failed: ${error.message}`);
    }
    
    if (data.error) {
        console.error(`ClickUp API error via proxy for path ${path}:`, data.details);
        throw new Error(data.error);
    }

    return data;
};


// --- Token Management Functions (using RPC) ---
export const saveUserClickUpToken = async (token: string) => {
  const { error } = await supabase.rpc('save_user_clickup_token', { api_token_value: token });
  if (error) {
    console.error('Error saving ClickUp token:', error);
    throw new Error('Could not save the ClickUp API token.');
  }
};

export const getUserClickUpToken = async () => {
  const { data, error } = await supabase.rpc('get_user_clickup_token');
  if (error) {
    console.error('Error fetching token:', error);
    return null;
  }
  return data && data.length > 0 ? data[0].api_token : null;
};


// --- ClickUp Data Fetching Functions (via Proxy) ---
export const getClickUpWorkspaces = async (apiToken: string) => {
    const data = await callClickUpProxy(apiToken, 'team');
    return data.teams;
};

export const getClickUpSpaces = async (apiToken: string, teamId: string) => {
    const data = await callClickUpProxy(apiToken, `team/${teamId}/space`);
    return data.spaces;
};

export const getClickUpFolders = async (apiToken:string, spaceId: string) => {
    const data = await callClickUpProxy(apiToken, `space/${spaceId}/folder`);
    return data.folders;
};

export const getClickUpListsInFolder = async (apiToken:string, folderId: string) => {
    const data = await callClickUpProxy(apiToken, `folder/${folderId}/list`);
    return data.lists;
};

export const getClickUpListsInSpace = async (apiToken:string, spaceId: string) => {
    const data = await callClickUpProxy(apiToken, `space/${spaceId}/list`);
    return data.lists;
};

// --- NEW: More reliable way to get all fields by fetching a sample task ---
export const getClickUpFieldsFromSampleTask = async (apiToken: string, listId: string) => {
    // Get the first task from the list
    const tasksData = await callClickUpProxy(apiToken, `list/${listId}/task`);
    
    if (!tasksData.tasks || tasksData.tasks.length === 0) {
       // If the list is empty, we cannot determine fields reliably.
       // We could fall back to the /field endpoint, but it's better to inform the user.
       throw new Error("La lista está vacía. Añade al menos una tarea para poder leer la estructura de campos.");
    }
    
    const sampleTask = tasksData.tasks[0];
    
    // Extract standard fields from the task keys, excluding custom_fields array itself
    const standardFields = Object.keys(sampleTask)
        .filter(key => key !== 'custom_fields')
        .map(key => ({
            id: key,
            name: key, // Use the system name
            custom: false
        }));
    
    // Extract custom fields from the custom_fields array
    const customFields = sampleTask.custom_fields.map(cf => ({
        id: cf.id,
        name: cf.name,
        custom: true
    }));

    return [...standardFields, ...customFields];
};
