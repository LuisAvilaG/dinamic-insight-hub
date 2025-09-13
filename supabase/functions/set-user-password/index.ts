
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

// WARNING: This function is a powerful admin tool.
// It allows changing any user's password.
// It should be deleted immediately after use.

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return new Response(JSON.stringify({ error: "Se requiere userId y newPassword" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    // Create a Supabase client with the SERVICE_ROLE key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Update the user's password
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ message: `Contraseña para el usuario ${userId} actualizada con éxito.` }), {
      status: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});

/* 
  HOW TO USE:
  1. Deploy this function: `npx supabase functions deploy set-user-password`
  2. Get your project's anon key and URL.
  3. Get the user_id of the user you want to update from the 'Cuentas' table.
  4. Send a POST request using a tool like curl or Postman:

  curl -X POST 'https://<PROJECT_REF>.supabase.co/functions/v1/set-user-password' \
  -H 'Authorization: Bearer <YOUR_ANON_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": "THE_USER_ID_TO_UPDATE",
    "newPassword": "THE_NEW_STRONG_PASSWORD"
  }'

  5. VERY IMPORTANT: Delete the function after use: `npx supabase functions delete set-user-password`
*/
