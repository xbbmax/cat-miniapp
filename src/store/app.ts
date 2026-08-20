import { create } from 'zustand'

interface AppState {
  unreadCount: number
  isOnline: boolean

  setUnreadCount: (count: number) => void
  incrementUnread: () => void
  decrementUnread: () => void
  setOnline: (online: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  unreadCount: 0,
  isOnline: true,

  setUnreadCount: (count: number) => set({ unreadCount: count }),

  incrementUnread: () => set(state => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: () => set(state => ({
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),

  setOnline: (online: boolean) => set({ isOnline: online }),
}))
