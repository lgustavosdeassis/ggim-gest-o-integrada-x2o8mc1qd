import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'

export interface AppUser {
  id: string
  email: string
  name?: string | null
  role: 'admin' | 'owner' | 'editor' | 'viewer' | 'user'
  jobTitle?: string | null
  avatarUrl?: string | null
  canGenerateReports?: boolean
  canDeleteReports?: boolean
  allowedTabs?: string[] | null
}

interface AuthState {
  user: AppUser | null
  supabaseUser: SupabaseUser | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  isAuthenticated: boolean
  setAuth: (session: Session | null, user: SupabaseUser | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
  login: (user: AppUser) => void
  logout: () => void
  updateAvatar: (url: string) => void
  updateProfile: (data: Partial<AppUser>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  supabaseUser: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,

  setAuth: async (session, supabaseUser) => {
    set({ session, supabaseUser, loading: false, initialized: true })
    if (supabaseUser) {
      await get().fetchProfile(supabaseUser.id)
    } else {
      set({ profile: null, user: null, isAuthenticated: false })
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      const profile = data as any
      const supabaseUser = get().supabaseUser

      let parsedTabs: string[] = []
      try {
        const rawTabs = profile.allowed_tabs ?? supabaseUser?.user_metadata?.allowed_tabs
        if (Array.isArray(rawTabs)) {
          parsedTabs = rawTabs
        } else if (typeof rawTabs === 'string') {
          parsedTabs = JSON.parse(rawTabs)
        }
      } catch (e) {
        console.error('Error parsing allowedTabs', e)
      }

      set({
        profile,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role || supabaseUser?.user_metadata?.role || 'viewer',
          jobTitle: profile.job_title,
          avatarUrl: profile.avatar_url,
          canGenerateReports:
            profile.can_generate_reports ??
            supabaseUser?.user_metadata?.can_generate_reports ??
            false,
          canDeleteReports:
            profile.can_delete_reports ?? supabaseUser?.user_metadata?.can_delete_reports ?? false,
          allowedTabs: parsedTabs,
        },
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, supabaseUser: null, session: null, profile: null, isAuthenticated: false })
  },

  login: (user) => {
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    set({ user: null, isAuthenticated: false })
  },

  updateAvatar: (url) => {
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: url } : null,
      profile: state.profile ? { ...state.profile, avatar_url: url } : null,
    }))
    const userId = get().user?.id
    if (userId) {
      supabase.from('profiles').update({ avatar_url: url }).eq('id', userId).then()
    }
  },

  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
      profile: state.profile
        ? { ...state.profile, ...data, job_title: data.jobTitle || state.profile.job_title }
        : null,
    }))
    const userId = get().user?.id
    if (userId) {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle

      if (Object.keys(updateData).length > 0) {
        supabase.from('profiles').update(updateData).eq('id', userId).then()
      }
    }
  },
}))
