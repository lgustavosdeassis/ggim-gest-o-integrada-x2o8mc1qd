import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    // Utilize o client anônimo configurando o header global de Authorization
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    // Em Edge Functions, quando o header Authorization é passado globalmente,
    // recomenda-se chamar getUser() sem argumentos para validar a sessão corretamente.
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      throw new Error(`Unauthorized: ${authError?.message || 'No user found'}`)
    }

    // Utilize o admin client apenas para as operações privilegiadas
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'owner') {
      throw new Error('Forbidden: Only owners can manage users')
    }

    const body = await req.json()
    const { action, payload } = body

    if (action === 'create') {
      const { email, password, name, role, avatarUrl, jobTitle } = payload

      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })

      if (createError) throw createError

      // Update the profile created by the database trigger
      await supabaseAdmin
        .from('profiles')
        .update({
          name,
          role,
          avatar_url: avatarUrl,
          job_title: jobTitle,
        })
        .eq('id', newAuthUser.user.id)

      return new Response(JSON.stringify({ user: newAuthUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else if (action === 'delete') {
      const { id } = payload

      if (!id) {
        throw new Error('Missing user id')
      }

      if (id === user.id) {
        throw new Error('Forbidden: Cannot delete your own user account')
      }

      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

      // Ignore error if user is already deleted or not found
      if (error && !error.message.includes('User not found') && error.status !== 404) {
        throw error
      }

      // Ensure profile is deleted even if auth user wasn't found
      await supabaseAdmin.from('profiles').delete().eq('id', id)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Invalid action')
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
