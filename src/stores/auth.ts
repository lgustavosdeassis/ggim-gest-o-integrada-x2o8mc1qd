import { create } from 'zustand'
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
  canGenerateReports?: boolean
  allowedTabs?: string[]
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error

      const mappedUsers = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        role: p.role as Role,
        avatarUrl: p.avatar_url,
        jobTitle: p.job_title,
        canGenerateReports: p.can_generate_reports,
        allowedTabs: p.allowed_tabs,
      }))

      set((state) => {
        const isSameUsers = JSON.stringify(state.users) === JSON.stringify(mappedUsers)
        const updatedCurrentUser = state.user
          ? mappedUsers.find((u: any) => u.id === state.user!.id) || state.user
          : null

        if (isSameUsers && JSON.stringify(state.user) === JSON.stringify(updatedCurrentUser)) {
          return { isFetching: false }
        }

        return { users: mappedUsers as User[], user: updatedCurrentUser as User, isFetching: false }
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
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', state.user.id)
      if (error) throw error
      set({ user: { ...state.user, avatarUrl: url } })
      toast.success('Sucesso', { description: 'Avatar atualizado com sucesso.' })
    } catch (e) {
      toast.error('Erro', { description: 'Erro ao salvar avatar.' })
      throw e
    }
  },
  updateProfile: async (data) => {
    const state = get()
    if (!state.user) return
    try {
      const updates: any = {}
      if (data.name !== undefined) updates.name = data.name
      if (data.email !== undefined) updates.email = data.email
      if (data.role !== undefined) updates.role = data.role
      if (data.jobTitle !== undefined) updates.job_title = data.jobTitle
      if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl
      if (data.canGenerateReports !== undefined)
        updates.can_generate_reports = data.canGenerateReports
      if (data.allowedTabs !== undefined) updates.allowed_tabs = data.allowedTabs

      const { error } = await supabase.from('profiles').update(updates).eq('id', state.user.id)
      if (error) throw error

      set({ user: { ...state.user, ...data } })
      toast.success('Sucesso', { description: 'Perfil atualizado.' })
    } catch (e) {
      toast.error('Erro', { description: 'Erro ao atualizar perfil.' })
      throw e
    }
  },
  addUser: async (newUser) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) throw new Error('Sessão não encontrada.')

      const { error } = await supabase.functions.invoke('manage-user', {
        body: {
          action: 'create',
          payload: {
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            role: newUser.role,
            avatarUrl: newUser.avatarUrl,
            jobTitle: newUser.jobTitle,
            canGenerateReports: newUser.canGenerateReports,
            allowedTabs: newUser.allowedTabs,
          },
        },
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
      })

      if (error) throw error

      toast.success('Sucesso', { description: 'Usuário cadastrado com sucesso.' })
      get().fetchUsers()
    } catch (e: any) {
      toast.error('Erro', { description: e.message || 'Falha ao cadastrar usuário.' })
      throw e
    }
  },
  removeUser: async (id) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData?.session) throw new Error('Sessão não encontrada.')

      const { error } = await supabase.functions.invoke('manage-user', {
        body: { action: 'delete', payload: { id } },
        headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
      })

      if (error) throw error

      toast.success('Sucesso', { description: 'Usuário removido com sucesso.' })
      get().fetchUsers()
    } catch (e: any) {
      toast.error('Erro', { description: e.message || 'Falha ao remover usuário.' })
      throw e
    }
  },
}))
