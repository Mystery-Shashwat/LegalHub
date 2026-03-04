'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

interface User { id: string; name: string; email: string; role: string; lawyerStatus?: string }
interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login:    (email: string, pass: string) => Promise<string>
  logout:   () => void
  setUser:  (u: User) => void
}

export const useAuth = create<AuthStore>()(
  persist((set) => ({
    user: null,
    token: null,
    isLoading: false,

    login: async (email, password) => {
      set({ isLoading: true })
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('accessToken',  data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      set({ user: data.user, token: data.accessToken, isLoading: false })
      return data.redirectTo
    },

    logout: () => {
      const rt = localStorage.getItem('refreshToken')
      if (rt) api.post('/auth/logout', { refreshToken: rt }).catch(() => {})
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      set({ user: null, token: null })
      window.location.href = '/'
    },

    setUser: (u) => set({ user: u })
  }), { name: 'auth', partialize: (s) => ({ user: s.user, token: s.token }) })
)
