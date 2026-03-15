import { create } from 'zustand'

interface User {
  name: string
  email: string
  avatarUrl?: string | null
  role?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: () => void
  logout: () => void
  updateAvatar: (url: string) => void
  updateProfile: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: {
    name: 'Gestor GGIM',
    email: 'gestor@ggim.foz.br',
    avatarUrl: null,
    role: 'Gestor Administrativo',
  },
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  updateAvatar: (url) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: url } : null,
    })),
  updateProfile: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),
}))
