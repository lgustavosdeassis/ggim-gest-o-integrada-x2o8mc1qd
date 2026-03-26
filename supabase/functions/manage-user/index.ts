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

    const isAdmin =
      profile?.role === 'admin' ||
      profile?.role === 'owner' ||
      profile?.is_admin === true ||
      user.user_metadata?.is_admin === true ||
      user.user_metadata?.role === 'admin'

    if (!isAdmin) {
      throw new Error('Unauthorized')
    }

    const body = await req.json()
    const { action, userData } = body

    if (action === 'list') {
      const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers()
      if (listError) throw listError

      const { data: profilesData } = await supabaseAdmin.from('profiles').select('*')
      const profiles = profilesData || []

      const users = authData.users.map((u) => {
        const p = profiles.find((prof) => prof.id === u.id)
        return {
          id: u.id,
          email: u.email,
          name: u.user_metadata?.name || p?.name || '',
          role: u.user_metadata?.role || p?.role || 'user',
          status: u.user_metadata?.status || p?.status || 'active',
          job_title: u.user_metadata?.job_title || p?.job_title || '',
          is_admin: u.user_metadata?.is_admin || p?.is_admin || p?.role === 'admin' || false,
          can_generate_reports:
            u.user_metadata?.can_generate_reports || p?.can_generate_reports || false,
          can_delete_reports: u.user_metadata?.can_delete_reports || p?.can_delete_reports || false,
          allowed_tabs: u.user_metadata?.allowed_tabs || p?.allowed_tabs || [],
        }
      })

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    if (action === 'create') {
      const userMeta = {
        name: userData.name,
        role: userData.role || 'user',
        status: userData.status || 'active',
        job_title: userData.job_title || '',
        is_admin: userData.is_admin || userData.role === 'admin',
        can_generate_reports: userData.can_generate_reports || false,
        can_delete_reports: userData.can_delete_reports || false,
        allowed_tabs: userData.allowed_tabs || [],
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: userMeta,
      })

      if (createError) throw createError

      const profileData: any = {
        name: userData.name,
        role: userData.role || 'user',
        job_title: userData.job_title || '',
        is_admin: userData.is_admin || userData.role === 'admin',
        can_generate_reports: userData.can_generate_reports || false,
        can_delete_reports: userData.can_delete_reports || false,
        allowed_tabs: userData.allowed_tabs || [],
      }

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
        can_delete_reports,
        allowed_tabs,
      } = userData

      const { data: currentUser, error: getUserError } =
        await supabaseAdmin.auth.admin.getUserById(id)
      if (getUserError) throw getUserError

      const currentMeta = currentUser.user.user_metadata || {}

      const newMeta = {
        ...currentMeta,
        name: name !== undefined ? name : currentMeta.name,
        role: role !== undefined ? role : currentMeta.role,
        status: status !== undefined ? status : currentMeta.status,
        job_title: job_title !== undefined ? job_title : currentMeta.job_title,
        is_admin: is_admin !== undefined ? is_admin : currentMeta.is_admin,
        can_generate_reports:
          can_generate_reports !== undefined
            ? can_generate_reports
            : currentMeta.can_generate_reports,
        can_delete_reports:
          can_delete_reports !== undefined ? can_delete_reports : currentMeta.can_delete_reports,
        allowed_tabs: allowed_tabs !== undefined ? allowed_tabs : currentMeta.allowed_tabs,
      }

      const updateData: any = { user_metadata: newMeta }
      if (email) updateData.email = email
      if (password) updateData.password = password

      const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(
        id,
        updateData,
      )
      if (updateAuthError) throw updateAuthError

      const profileData: any = {}
      if (name !== undefined) profileData.name = name
      if (role !== undefined) profileData.role = role
      if (job_title !== undefined) profileData.job_title = job_title
      if (is_admin !== undefined) profileData.is_admin = is_admin
      if (can_generate_reports !== undefined)
        profileData.can_generate_reports = can_generate_reports
      if (can_delete_reports !== undefined) profileData.can_delete_reports = can_delete_reports
      if (allowed_tabs !== undefined) profileData.allowed_tabs = allowed_tabs

      if (Object.keys(profileData).length > 0) {
        await supabaseAdmin.from('profiles').update(profileData).eq('id', id)
      }

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
