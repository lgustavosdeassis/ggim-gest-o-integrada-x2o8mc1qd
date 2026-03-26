import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

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

    const token = authHeader.replace('Bearer ', '')

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      throw new Error(`Unauthorized: Auth session missing!`)
    }

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
      const { email, password, name, role, avatarUrl, jobTitle, canGenerateReports, allowedTabs } =
        payload

      const { data: newAuthUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
      })

      if (createError) throw createError

      await supabaseAdmin
        .from('profiles')
        .update({
          name,
          role,
          avatar_url: avatarUrl,
          job_title: jobTitle,
          can_generate_reports: canGenerateReports ?? false,
          allowed_tabs: allowedTabs ?? [],
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

      if (error && !error.message.includes('User not found') && error.status !== 404) {
        throw error
      }

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
