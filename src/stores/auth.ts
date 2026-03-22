import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    email: 'admin@ggim.foz.br',
    password: 'admin',
    role: 'owner',
    name: 'Gestor GGIM',
    jobTitle: 'Proprietário',
  },
  {
    id: '2',
    email: 'editor@ggim.foz.br',
    password: 'editor',
    role: 'editor',
    name: 'Editor GGIM',
    jobTitle: 'Editor',
  },
  {
    id: '3',
    email: 'viewer@ggim.foz.br',
    password: 'viewer',
    role: 'viewer',
    name: 'Visualizador GGIM',
    jobTitle: 'Visualizador',
  },
]

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  users: User[]
  login: (user: User) => void
  logout: () => void
  updateAvatar: (url: string) => void
  updateProfile: (data: Partial<User>) => void
  addUser: (user: User) => void
  removeUser: (id: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      users: DEFAULT_USERS,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      updateAvatar: (url) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl: url } : null,
          users: state.user
            ? state.users.map((u) => (u.id === state.user!.id ? { ...u, avatarUrl: url } : u))
            : state.users,
        })),
      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
          users: state.user
            ? state.users.map((u) => (u.id === state.user!.id ? { ...u, ...data } : u))
            : state.users,
        })),
      addUser: (newUser) => set((state) => ({ users: [...state.users, newUser] })),
      removeUser: (id) => set((state) => ({ users: state.users.filter((u) => u.id !== id) })),
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          let updated = false
          const newUsers = state.users.map((u) => {
            if (u.email === 'admin@ggim.foz.br' && u.role !== 'owner') {
              updated = true
              return { ...u, role: 'owner' as Role, jobTitle: 'Proprietário' }
            }
            return u
          })
          if (updated) {
            state.users = newUsers
            if (state.user?.email === 'admin@ggim.foz.br') {
              state.user = { ...state.user, role: 'owner', jobTitle: 'Proprietário' }
            }
          }
        }
      },
    },
  ),
)

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'auth-storage') {
      useAuthStore.persist.rehydrate()
    }
  })
}
