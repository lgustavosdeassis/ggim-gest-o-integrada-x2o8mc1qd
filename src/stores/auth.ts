import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'
import { Profile } from '@/lib/types'

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
  profile: Profile | null
  loading: boolean
  initialized: boolean
  isAuthenticated: boolean
  fetchProfile: (email: string) => Promise<void>
  login: (user: AppUser) => void
  logout: () => void
  updateAvatar: (url: string) => void
  updateProfile: (data: Partial<AppUser>) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,
  isAuthenticated: false,

  fetchProfile: async (email: string) => {
    try {
      const pbUser = pb.authStore.record
      if (!pbUser) return

      let profile: any = null
      try {
        profile = await pb.collection('profiles').getFirstListItem(`email="${email}"`)
      } catch (err) {
        console.warn('Profile not found for this user.')
      }

      let parsedTabs: string[] = []
      try {
        const rawTabs = profile?.allowed_tabs || []
        if (Array.isArray(rawTabs)) {
          parsedTabs = rawTabs
        }
      } catch (e) {
        console.error('Error parsing allowedTabs', e)
      }

      const appUser: AppUser = {
        id: profile?.id || pbUser.id,
        email: email,
        name: profile?.name || pbUser.name || 'Usuário',
        role: (profile?.Role?.toLowerCase() || 'viewer') as any,
        jobTitle: profile?.job_title,
        avatarUrl: profile?.avatar_url,
        canGenerateReports: profile?.can_generate_reports ?? false,
        canDeleteReports: profile?.can_delete_reports ?? false,
        allowedTabs: parsedTabs,
      }

      set({
        profile: profile as any,
        user: appUser,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Failed to fetch profile', error)
    }
  },

  login: (user) => {
    set({ user, isAuthenticated: true })
  },

  logout: () => {
    set({ user: null, profile: null, isAuthenticated: false })
  },

  updateAvatar: (url) => {
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: url } : null,
      profile: state.profile ? { ...state.profile, avatar_url: url } : null,
    }))
    const profileId = get().profile?.id
    if (profileId) {
      pb.collection('profiles').update(profileId, { avatar_url: url }).catch(console.error)
    }
  },

  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
      profile: state.profile
        ? { ...state.profile, ...data, job_title: data.jobTitle || state.profile.job_title }
        : null,
    }))
    const profileId = get().profile?.id
    if (profileId) {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle

      if (Object.keys(updateData).length > 0) {
        pb.collection('profiles').update(profileId, updateData).catch(console.error)
      }
    }
  },
}))
