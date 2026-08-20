import { create } from 'zustand'
import { DEFAULT_FEATURE_FLAGS, settingsApi, type FeatureFlags } from '@/services/settings'

interface FeatureFlagsState {
  flags: FeatureFlags
  isLoaded: boolean
  loadFlags: () => Promise<FeatureFlags>
}

export const useFeatureFlagsStore = create<FeatureFlagsState>((set, get) => ({
  flags: DEFAULT_FEATURE_FLAGS,
  isLoaded: false,

  loadFlags: async () => {
    const res = await settingsApi.getFeatureFlags()
    const flags = res.success && res.data ? res.data : get().flags
    set({ flags, isLoaded: true })
    return flags
  },
}))
