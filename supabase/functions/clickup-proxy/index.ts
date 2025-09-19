// supabase/functions/clickup-proxy/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    console.log("Received request data:", requestData); // Log 1: What we received

    const { clickup_path, api_token, method, body } = requestData;
    
    if (!clickup_path || !api_token || !method) {
        console.error("Missing required parameters.");
        return new Response(JSON.stringify({ error: "Missing required parameters: clickup_path, api_token, method" }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    const CLICKUP_API_BASE_URL = 'https://api.clickup.com/api/v2';
    const url = `${CLICKUP_API_BASE_URL}/${clickup_path}`;
    console.log(`Forwarding request to ClickUp URL: ${url}`); // Log 2: Where we are sending it

    const requestOptions = {
        method: method,
        headers: {
            'Authorization': api_token,
            'Content-Type': 'application/json'
        },
        body: body ? JSON.stringify(body) : undefined
    };

    const response = await fetch(url, requestOptions);
    const responseData = await response.json().catch(() => ({})); // Handle cases with no JSON body
    
    console.log("Received response from ClickUp:", { // Log 3: What ClickUp responded
        status: response.status,
        statusText: response.statusText,
        data: responseData
    });

    if (!response.ok) {
         return new Response(JSON.stringify({ error: 'ClickUp API request failed', details: responseData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: response.status,
        });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error("Error inside Edge Function:", error.message); // Log 4: Any other error
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
