import Taro from '@tarojs/taro'

const STORAGE_PREFIX = 'catcare_'

// 本地存储服务
export const storage = {
  // 保存数据
  set: async (key: string, value: any): Promise<void> => {
    try {
      await Taro.setStorage({
        key: STORAGE_PREFIX + key,
        data: value,
      })
    } catch (error) {
      console.error(`存储失败 [${key}]:`, error)
    }
  },

  // 同步保存
  setSync: (key: string, value: any): void => {
    try {
      Taro.setStorageSync(STORAGE_PREFIX + key, value)
    } catch (error) {
      console.error(`存储失败 [${key}]:`, error)
    }
  },

  // 获取数据
  get: async <T = any>(key: string): Promise<T | null> => {
    try {
      const res = await Taro.getStorage({ key: STORAGE_PREFIX + key })
      return res.data as T
    } catch {
      return null
    }
  },

  // 同步获取
  getSync: <T = any>(key: string): T | null => {
    try {
      return Taro.getStorageSync(STORAGE_PREFIX + key)
    } catch {
      return null
    }
  },

  // 删除数据
  remove: async (key: string): Promise<void> => {
    try {
      await Taro.removeStorage({ key: STORAGE_PREFIX + key })
    } catch (error) {
      console.error(`删除存储失败 [${key}]:`, error)
    }
  },

  // 清除所有应用数据
  clear: async (): Promise<void> => {
    try {
      const res = await Taro.getStorageInfo()
      const keys = res.keys.filter(k => k.startsWith(STORAGE_PREFIX))
      for (const key of keys) {
        await Taro.removeStorage({ key })
      }
    } catch (error) {
      console.error('清除存储失败:', error)
    }
  },

  // 常量key
  keys: {
    TOKEN: 'token',
    USER_INFO: 'user_info',
    REMEMBER_EMAIL: 'remember_email',
    SETTINGS: 'settings',
  },
}
