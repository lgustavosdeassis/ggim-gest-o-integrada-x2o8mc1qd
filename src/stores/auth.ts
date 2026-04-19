import { create } from 'zustand'
import pb from '@/lib/pocketbase/client'
import { db } from '@/lib/db/database-service'

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
  loading: true,
  initialized: false,
  isAuthenticated: false,

  fetchProfile: async (email: string) => {
    try {
      const pbUser = pb.authStore.record
      if (!pbUser) return

      let parsedTabs: string[] = []
      try {
        const rawTabs = pbUser?.allowed_tabs || []
        if (Array.isArray(rawTabs)) {
          parsedTabs = rawTabs
        }
      } catch (e) {
        console.error('Error parsing allowedTabs', e)
      }

      const appUser: AppUser = {
        id: pbUser.id,
        email: email,
        name: pbUser.name || 'Usuário',
        role: (pbUser.role?.toLowerCase() || 'user') as any,
        jobTitle: pbUser.job_title,
        avatarUrl: pbUser.avatar_url,
        canGenerateReports: pbUser.can_generate_reports ?? false,
        canDeleteReports: pbUser.can_delete_reports ?? false,
        allowedTabs: parsedTabs,
      }

      set({
        user: appUser,
        isAuthenticated: true,
      })
    } catch (error) {
      console.error('Failed to fetch user', error)
    }
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
    }))
    const userId = get().user?.id
    if (userId) {
      db.collection('users').update(userId, { avatar_url: url }).catch(console.error)
    }
  },

  updateProfile: (data) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    }))
    const userId = get().user?.id
    if (userId) {
      const updateData: any = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.jobTitle !== undefined) updateData.job_title = data.jobTitle

      if (Object.keys(updateData).length > 0) {
        db.collection('users').update(userId, updateData).catch(console.error)
      }
    }
  },
}))
