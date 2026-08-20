import { api } from './api'
import type { ApiResponse } from '@/types'

export interface FeatureFlags {
  pet: boolean
  vaccine: boolean
  medication: boolean
  product: boolean
  dashboard: boolean
  profileMembership: boolean
  profileManualMembership: boolean
  profileEdit: boolean
  profileReminderSettings: boolean
  profilePassword: boolean
  profileFeedback: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  pet: true,
  vaccine: true,
  medication: true,
  product: true,
  dashboard: true,
  profileMembership: true,
  profileManualMembership: true,
  profileEdit: true,
  profileReminderSettings: true,
  profilePassword: true,
  profileFeedback: true,
}

const normalizeFlags = (data?: Partial<FeatureFlags>): FeatureFlags => ({
  pet: data?.pet !== false,
  vaccine: data?.vaccine !== false,
  medication: data?.medication !== false,
  product: data?.product !== false,
  dashboard: data?.dashboard !== false,
  profileMembership: data?.profileMembership !== false,
  profileManualMembership: data?.profileManualMembership !== false,
  profileEdit: data?.profileEdit !== false,
  profileReminderSettings: data?.profileReminderSettings !== false,
  profilePassword: data?.profilePassword !== false,
  profileFeedback: data?.profileFeedback !== false,
})

export const settingsApi = {
  getFeatureFlags: async (): Promise<ApiResponse<FeatureFlags>> => {
    const res = await api.get<Partial<FeatureFlags>>('/settings/bottom-nav')
    if (!res.success) return res as ApiResponse<FeatureFlags>

    return {
      ...res,
      data: normalizeFlags(res.data),
    }
  },
}
