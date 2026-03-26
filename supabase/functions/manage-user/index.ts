import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Invalid token')
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    // Allow access if user is marked as admin either by boolean flag or by role string
    const isAdmin =
      profile?.is_admin === true || profile?.role === 'admin' || profile?.role === 'owner'

    if (!isAdmin) {
      throw new Error('Unauthorized')
    }

    const body = await req.json()
    const { action, userData } = body

    if (action === 'create') {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: { name: userData.name },
      })

      if (createError) throw createError

      const profileData: any = {
        name: userData.name,
        role: userData.role || 'user',
        status: userData.status || 'active',
        job_title: userData.job_title || null,
      }

      if (userData.is_admin !== undefined) profileData.is_admin = userData.is_admin
      if (userData.can_generate_reports !== undefined)
        profileData.can_generate_reports = userData.can_generate_reports
      if (userData.allowed_tabs !== undefined) profileData.allowed_tabs = userData.allowed_tabs

      await supabaseAdmin.from('profiles').update(profileData).eq('id', newUser.user.id)

      return new Response(JSON.stringify({ user: newUser.user }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'update') {
      const {
        id,
        email,
        password,
        name,
        role,
        is_admin,
        status,
        job_title,
        can_generate_reports,
        allowed_tabs,
      } = userData

      const updateData: any = {}
      if (email) updateData.email = email
      if (password) updateData.password = password

      if (Object.keys(updateData).length > 0) {
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
          id,
          updateData,
        )
        if (updateAuthError) throw updateAuthError
      }

      const profileData: any = {
        name,
        role,
        status,
        job_title: job_title || null,
      }

      if (is_admin !== undefined) profileData.is_admin = is_admin
      if (can_generate_reports !== undefined)
        profileData.can_generate_reports = can_generate_reports
      if (allowed_tabs !== undefined) profileData.allowed_tabs = allowed_tabs

      const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update(profileData)
        .eq('id', id)

      if (updateProfileError) throw updateProfileError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'delete') {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userData.id)
      if (deleteError) throw deleteError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
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
