import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,

      setAuth: (user, token) => {
        localStorage.setItem('devmind_token', token)
        set({ user, token })
      },

      clearAuth: () => {
        localStorage.removeItem('devmind_token')
        set({ user: null, token: null })
      },

      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'devmind_auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
)
