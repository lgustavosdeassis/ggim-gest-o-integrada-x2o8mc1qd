import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import { Profile } from '@/lib/types'
import { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setAuth: (session: Session | null, user: User | null) => void
  fetchProfile: (userId: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,
  initialized: false,

  setAuth: async (session, user) => {
    set({ session, user, loading: false, initialized: true })
    if (user) {
      await get().fetchProfile(user.id)
    } else {
      set({ profile: null })
    }
  },

  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      set({ profile: data as Profile })
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, profile: null })
  },
}))
