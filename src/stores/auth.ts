import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { User as SupabaseUser, Session } from '@supabase/supabase-js'

export interface AppUser {
  id: string
  email: string
  name?: string | null
  role: 'admin' | 'user' | 'viewer'
  jobTitle?: string | null
  avatarUrl?: string | null
  canGenerateReports?: boolean
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

      const profile = data as Profile
      set({
        profile,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role as any,
          jobTitle: profile.job_title,
          avatarUrl: profile.avatar_url,
          canGenerateReports: profile.can_generate_reports,
          allowedTabs: profile.allowed_tabs,
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
}))
