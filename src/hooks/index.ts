import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'

// 认证相关 hook
export const useAuth = () => {
  const { isLoggedIn, user, token } = useAuthStore()

  // 检查登录状态，未登录则跳转登录页
  const requireAuth = (): boolean => {
    if (!isLoggedIn) {
      Taro.navigateTo({ url: '/pages/auth/login/index' })
      return false
    }
    return true
  }

  // 检查是否为管理员
  const requireAdmin = (): boolean => {
    if (!requireAuth()) return false
    if (user?.role !== 'admin') {
      Taro.showToast({ title: '需要管理员权限', icon: 'none' })
      return false
    }
    return true
  }

  return {
    isLoggedIn,
    user,
    token,
    requireAuth,
    requireAdmin,
  }
}

// 通用数据加载 hook
import { useState, useCallback } from 'react'

interface LoadState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refreshing: boolean
}

export const useLoad = <T = any>() => {
  const [state, setState] = useState<LoadState<T>>({
    data: null,
    loading: false,
    error: null,
    refreshing: false,
  })

  const run = useCallback(async <R extends T>(fetcher: () => Promise<{ success: boolean; data?: R; error?: string }>) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const res = await fetcher()
      if (res.success) {
        setState({ data: res.data as T || null, loading: false, error: null, refreshing: false })
        return res.data
      } else {
        setState(prev => ({ ...prev, loading: false, error: res.error || '加载失败' }))
        return null
      }
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err?.message || '网络错误' }))
      return null
    }
  }, [])

  const refresh = useCallback(async <R extends T>(fetcher: () => Promise<{ success: boolean; data?: R; error?: string }>) => {
    setState(prev => ({ ...prev, refreshing: true }))
    try {
      const res = await fetcher()
      if (res.success) {
        setState({ data: res.data as T || null, loading: false, error: null, refreshing: false })
        return res.data
      }
      return null
    } catch (err: any) {
      setState(prev => ({ ...prev, refreshing: false }))
      return null
    }
  }, [])

  return { ...state, run, refresh }
}
