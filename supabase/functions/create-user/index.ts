import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

console.log('Function \"create-user\" starting up')

serve(async (req) => {
  console.log('Request received for \"create-user\"')

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, nombre, rol, estado } = await req.json()
    console.log(`Payload received:`, { email, nombre, rol, estado })

    if (!email) {
      console.error('Error: Email is missing from payload.')
      return new Response(JSON.stringify({ error: 'El email es obligatorio' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Error: Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
      return new Response(JSON.stringify({ error: 'Configuration error on server.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    console.log('Environment variables loaded.')

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)
    console.log('Supabase admin client created.')

    const { data, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email)

    if (authError) {
      console.error('Error inviting user:', authError.message)
      return new Response(JSON.stringify({ error: `Auth Error: ${authError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    console.log('User invited successfully:', data.user.id)

    // IMPORTANT: We no longer insert the 'id' column as it does not exist in the 'Cuentas' table.
    const { error: cuentasError } = await supabaseAdmin
      .from('Cuentas')
      .insert({
        Correo: email,
        Nombre: nombre,
        Rol: rol,
        Estado: estado,
      })

    if (cuentasError) {
      console.error('Error inserting into Cuentas table:', cuentasError.message)
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      console.log('Rolled back auth user creation.')
      return new Response(JSON.stringify({ error: `Cuentas Error: ${cuentasError.message}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }
    
    console.log('User details inserted into Cuentas table successfully.')

    return new Response(JSON.stringify({ message: 'User created and invitation sent successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (e) {
    console.error('Top-level catch block error:', e.message)
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
