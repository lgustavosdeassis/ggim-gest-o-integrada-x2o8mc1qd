import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '@/lib/api'

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
  logout: () => void
  updateAvatar: (url: string) => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  addUser: (user: User) => Promise<void>
  removeUser: (id: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
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
              ? data.find((u) => u.id === state.user!.id) || state.user
              : null
            return { users: data, user: updatedCurrentUser, isFetching: false }
          })
        } catch (e) {
          set({ isFetching: false })
        }
      },
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateAvatar: async (url) => {
        const state = get()
        if (!state.user) return
        const updatedUser = { ...state.user, avatarUrl: url }

        set({ user: updatedUser })
        await api.users.syncUpdate((list) =>
          list.map((u) => (u.id === state.user!.id ? updatedUser : u)),
        )
        get().fetchUsers()
      },
      updateProfile: async (data) => {
        const state = get()
        if (!state.user) return
        const updatedUser = { ...state.user, ...data }

        set({ user: updatedUser })
        await api.users.syncUpdate((list) =>
          list.map((u) => (u.id === state.user!.id ? updatedUser : u)),
        )
        get().fetchUsers()
      },
      addUser: async (newUser) => {
        set((state) => ({ users: [...state.users, newUser] }))
        await api.users.syncUpdate((list) => [...list, newUser])
        get().fetchUsers()
      },
      removeUser: async (id) => {
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }))
        await api.users.syncUpdate((list) => list.filter((u) => u.id !== id))
        get().fetchUsers()
      },
    }),
    {
      name: 'auth-session',
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, user: state.user }),
    },
  ),
)
