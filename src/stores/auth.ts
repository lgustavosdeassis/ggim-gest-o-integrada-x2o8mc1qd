import { create } from 'zustand'

interface User {
  name: string
  email: string
  avatarUrl?: string | null
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  login: () => void
  logout: () => void
  updateAvatar: (url: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true,
  user: {
    name: 'Gestor GGIM',
    email: 'gestor@ggim.foz.br',
    avatarUrl: null,
  },
  login: () => set({ isAuthenticated: true }),
  logout: () => set({ isAuthenticated: false }),
  updateAvatar: (url) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl: url } : null,
    })),
}))
