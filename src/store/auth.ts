import { create } from 'zustand'
import { storage } from '@/services/storage'
import type { User } from '@/types'

interface AuthState {
  token: string | null
  user: User | null
  isLoggedIn: boolean
  isInitialized: boolean

  setAuth: (token: string, user: User) => void
  setUser: (user: User) => void
  logout: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isLoggedIn: false,
  isInitialized: false,

  setAuth: (token: string, user: User) => {
    storage.setSync(storage.keys.TOKEN, token)
    storage.setSync(storage.keys.USER_INFO, user)
    set({ token, user, isLoggedIn: true })
  },

  setUser: (user: User) => {
    storage.setSync(storage.keys.USER_INFO, user)
    set({ user })
  },

  logout: () => {
    storage.remove(storage.keys.TOKEN)
    storage.remove(storage.keys.USER_INFO)
    set({ token: null, user: null, isLoggedIn: false })
  },

  initialize: async () => {
    try {
      const token = await storage.get<string>(storage.keys.TOKEN)
      const user = await storage.get<User>(storage.keys.USER_INFO)
      set({
        token,
        user,
        isLoggedIn: !!(token && user),
        isInitialized: true,
      })
    } catch {
      set({ isInitialized: true })
    }
  },
}))
