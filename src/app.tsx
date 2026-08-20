import React, { useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { notificationsApi } from '@/services/notifications'
import { useAppStore } from '@/store/app'
import { useFeatureFlagsStore } from '@/store/featureFlags'
import Taro from '@tarojs/taro'
import './app.scss'

const App: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initialize, isInitialized, isLoggedIn } = useAuthStore()
  const { setUnreadCount, setOnline } = useAppStore()
  const { loadFlags } = useFeatureFlagsStore()

  useEffect(() => {
    let mounted = true

    const initApp = async () => {
      try {
        await loadFlags()
        await initialize()
      } catch (error) {
        console.error('[App] initialize failed:', error)
      }
    }

    if (mounted) initApp()

    return () => {
      mounted = false
    }
  }, [initialize, loadFlags])

  useEffect(() => {
    try {
      if (typeof Taro.onNetworkStatusChange !== 'function') return

      Taro.onNetworkStatusChange((res) => {
        setOnline(res.isConnected)
        if (!res.isConnected) {
          Taro.showToast({ title: '网络连接已断开', icon: 'none', duration: 2000 })
        }
      })
    } catch (error) {
      console.error('[App] network listener failed:', error)
    }
  }, [setOnline])

  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      notificationsApi
        .getUnreadCount()
        .then((res) => {
          if (res.success && res.data) {
            setUnreadCount(res.data.count)
          }
        })
        .catch((error) => {
          console.error('[App] unread count failed:', error)
        })
    }
  }, [isInitialized, isLoggedIn, setUnreadCount])

  return <>{children}</>
}

export default App
