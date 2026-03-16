import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  role: 'editor' | 'viewer'
  jobTitle?: string
  password?: string
}

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    email: 'admin@ggim.foz.br',
    password: 'admin',
    role: 'editor',
    name: 'Gestor GGIM',
    jobTitle: 'Gestor Administrativo',
  },
  {
    id: '2',
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
    },
  ),
)
