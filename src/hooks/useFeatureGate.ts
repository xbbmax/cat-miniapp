import Taro from '@tarojs/taro'
import { useFeatureFlagsStore } from '@/store/featureFlags'
import type { FeatureFlags } from '@/services/settings'

export const FEATURE_PAGE_MAP: Record<string, keyof FeatureFlags> = {
  '/pages/pets/index/index': 'pet',
  '/pages/pets/add/index': 'pet',
  '/pages/pets/detail/index': 'pet',
  '/pages/vaccines/index/index': 'vaccine',
  '/pages/vaccines/add/index': 'vaccine',
  '/pages/vaccines/detail/index': 'vaccine',
  '/pages/medications/index/index': 'medication',
  '/pages/medications/add/index': 'medication',
  '/pages/medications/detail/index': 'medication',
  '/pages/products/index/index': 'product',
  '/pages/products/add/index': 'product',
  '/pages/products/detail/index': 'product',
  '/pages/membership/index': 'profileMembership',
  '/pages/membership/open/index': 'profileManualMembership',
  '/pages/profile/edit/index': 'profileEdit',
  '/pages/settings/index/index': 'profileReminderSettings',
  '/pages/settings/password/index': 'profilePassword',
  '/pages/settings/feedback/index': 'profileFeedback',
}

export const useFeatureGate = () => {
  const { flags, loadFlags } = useFeatureFlagsStore()

  const isEnabled = (key: keyof FeatureFlags): boolean => flags[key] !== false

  const guardFeature = async (key: keyof FeatureFlags): Promise<boolean> => {
    const latest = await loadFlags()
    if (latest[key] !== false) return true

    Taro.reLaunch({ url: '/pages/index/index' })
    return false
  }

  const canOpenUrl = (url: string): boolean => {
    const key = FEATURE_PAGE_MAP[url]
    if (!key || isEnabled(key)) return true
    Taro.reLaunch({ url: '/pages/index/index' })
    return false
  }

  return {
    flags,
    isEnabled,
    guardFeature,
    canOpenUrl,
  }
}
