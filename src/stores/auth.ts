import { create } from 'zustand'
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type Role = 'owner' | 'editor' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: Role
  jobTitle?: string
  password?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  users: User[]
  isFetching: boolean
  fetchUsers: () => Promise<void>
  login: (user: User) => void
  logout: () => Promise<void>
  updateAvatar: (url: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  addUser: (user: User) => Promise<void>
  removeUser: (id: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  user: null,
  users: [],
  isFetching: false,
  fetchUsers: async () => {
    set({ isFetching: true })
    try {
      const data = await api.users.list()
      set((state) => {
        const updatedCurrentUser = state.user
          ? data.find((u: any) => u.id === state.user!.id) || state.user
          : null
        return { users: data as User[], user: updatedCurrentUser as User, isFetching: false }
      })
    } catch (e) {
      set({ isFetching: false })
    }
  },
  login: (user) => set({ isAuthenticated: true, user }),
  logout: async () => {
    await supabase.auth.signOut()
    set({ isAuthenticated: false, user: null })
  },
  updateAvatar: async (url) => {
    const state = get()
    if (!state.user) return
    try {
      await api.users.update(state.user.id, { avatarUrl: url })
      set({ user: { ...state.user, avatarUrl: url } })
      toast.success('Sucesso', { description: 'Avatar atualizado com sucesso.' })
    } catch (e) {
      toast.error('Erro', { description: 'Erro ao salvar avatar.' })
    }
  },
  updateProfile: async (data) => {
    const state = get()
    if (!state.user) return
    try {
      await api.users.update(state.user.id, data)
      set({ user: { ...state.user, ...data } })
      toast.success('Sucesso', { description: 'Perfil atualizado.' })
    } catch (e) {
      toast.error('Erro', { description: 'Erro ao atualizar perfil.' })
    }
  },
  addUser: async (newUser) => {
    // Administrativo: gerenciado fora deste escopo local ou via supabase auth admin
  },
  removeUser: async (id) => {
    // Administrativo: gerenciado fora deste escopo local ou via supabase auth admin
  },
}))
