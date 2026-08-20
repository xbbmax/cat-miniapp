import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import type { ApiResponse } from '@/types'

// API基础URL - 通过环境变量配置，未配置时不发起真实网络请求
// 请在项目根目录 .env.production 中设置 TARO_APP_API_URL
const getBaseUrl = (): string => {
  if (process.env.TARO_APP_API_URL) {
    return process.env.TARO_APP_API_URL.replace(/\/+$/, '')
  }
  console.warn('[宠爱有期] 生产环境 API 地址未配置，请设置 TARO_APP_API_URL 环境变量')
  return ''
}

const BASE_URL = getBaseUrl()

// 防止多个请求同时触发 reLaunch 跳转
let isRedirectingToLogin = false

const getErrorMessage = (payload: any, fallback: string): string => {
  const error = payload?.error
  if (typeof payload?.message === 'string' && payload.message) return payload.message
  if (typeof error === 'string' && error) return error
  if (typeof error?.message === 'string' && error.message) return error.message
  return fallback
}

const normalizeResponse = <T>(payload: any, fallback = '请求失败'): ApiResponse<T> => {
  if (!payload || typeof payload !== 'object') {
    return {
      success: false,
      error: fallback,
    }
  }

  if (payload?.success === false) {
    return {
      ...payload,
      error: getErrorMessage(payload, fallback),
    }
  }
  return payload as ApiResponse<T>
}

// 请求拦截器 - 添加认证头
const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = useAuthStore.getState().token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// 通用请求方法
async function request<T = any>(
  url: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    data?: any
    header?: Record<string, string>
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', data, header } = options

  if (!BASE_URL) {
    return {
      success: false,
      error: '接口地址未配置，暂不能连接后台',
    }
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}/api/v1${url}`,
      method,
      data,
      header: { ...getHeaders(), ...header },
    })

    if (res.statusCode === 401) {
      if (!isRedirectingToLogin) {
        isRedirectingToLogin = true
        useAuthStore.getState().logout()
        Taro.showToast({ title: '登录已过期，请重新登录', icon: 'none', duration: 2000 })
        setTimeout(() => {
          isRedirectingToLogin = false
          Taro.reLaunch({ url: '/pages/auth/login/index' })
        }, 100)
      }
      return { success: false, error: '登录已过期，请重新登录' }
    }

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return normalizeResponse<T>(res.data)
    }

    if (res.statusCode === 404) {
      return { success: false, error: '请求的资源不存在' }
    }

    if (res.statusCode === 403) {
      return { success: false, error: '没有权限执行此操作' }
    }

    const errorData = res.data as any
    return {
      success: false,
      error: getErrorMessage(errorData, `请求失败 (${res.statusCode})`),
    }
  } catch (error: any) {
    console.error('API请求异常:', error)
    return {
      success: false,
      error: error?.errMsg || '网络连接失败，请检查网络设置',
    }
  }
}

// 便捷方法
export const api = {
  get: <T = any>(url: string, data?: Record<string, any>) =>
    request<T>(url, { method: 'GET', data }),

  post: <T = any>(url: string, data?: any) =>
    request<T>(url, { method: 'POST', data }),

  put: <T = any>(url: string, data?: any) =>
    request<T>(url, { method: 'PUT', data }),

  delete: <T = any>(url: string) =>
    request<T>(url, { method: 'DELETE' }),

  patch: <T = any>(url: string, data?: any) =>
    request<T>(url, { method: 'PATCH', data }),

  // 上传文件
  upload: async <T = any>(url: string, filePath: string, formData?: Record<string, any>): Promise<ApiResponse<T>> => {
    if (!BASE_URL) {
      return {
        success: false,
        error: '接口地址未配置，暂不能上传文件',
      }
    }

    try {
      const token = useAuthStore.getState().token
      const res = await Taro.uploadFile({
        url: `${BASE_URL}/api/v1${url}`,
        filePath,
        name: 'file',
        formData,
        header: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      })
      if (res.statusCode === 200) {
        return JSON.parse(res.data) as ApiResponse<T>
      }
      return { success: false, error: '上传失败' }
    } catch (error: any) {
      return { success: false, error: error?.errMsg || '上传失败' }
    }
  },
}
