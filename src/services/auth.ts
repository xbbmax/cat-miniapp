import { api } from './api'
import type { User } from '@/types'

interface LoginParams {
  email: string
  password: string
}

interface WechatLoginParams {
  code: string
}

interface RegisterParams {
  email: string
  password: string
  nickname?: string
}

interface AuthResult {
  user: User
  token: string
}

interface ForgotPasswordParams {
  email: string
}

interface ResetPasswordParams {
  token: string
  password: string
}

export const authApi = {
  login: (params: LoginParams) =>
    api.post<AuthResult>('/auth/login', params),

  wechatLogin: (params: WechatLoginParams) =>
    api.post<AuthResult>('/auth/wechat-login', params),

  register: (params: RegisterParams) =>
    api.post<AuthResult>('/auth/register', params),

  forgotPassword: (params: ForgotPasswordParams) =>
    api.post<{ message: string }>('/auth/forgot-password', params),

  resetPassword: (params: ResetPasswordParams) =>
    api.post<{ message: string }>('/auth/reset-password', params),

  getProfile: () =>
    api.get<User>('/users/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<User>('/users/profile', data),

  getBindingStatus: () =>
    api.get<Pick<User, 'wechatBound' | 'phoneBound' | 'bindingStatus'>>('/users/binding-status'),

  changePassword: (params: { currentPassword: string; newPassword: string }) =>
    api.put<{ message: string }>('/users/password', params),
}
