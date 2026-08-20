import React, { useEffect, useState } from 'react'
import { Button, Slider, Switch, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { authApi } from '@/services/auth'
import { useAuth } from '@/hooks'
import './index.scss'

const SettingsPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const { logout } = useAuthStore()
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [advanceDays, setAdvanceDays] = useState(7)
  const [showHomeSummary, setShowHomeSummary] = useState(true)
  const [showEmptyReminders, setShowEmptyReminders] = useState(true)
  const [compactList, setCompactList] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!requireAuth()) return
    const user = useAuthStore.getState().user
    if (user) {
      setReminderEnabled(user.reminderEnabled)
      setAdvanceDays(user.reminderAdvanceDays || 7)
    }
    const localSettings = Taro.getStorageSync('app_settings') || {}
    setShowHomeSummary(localSettings.showHomeSummary ?? true)
    setShowEmptyReminders(localSettings.showEmptyReminders ?? true)
    setCompactList(localSettings.compactList ?? false)
  }, [requireAuth])

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      const res = await authApi.updateProfile({ reminderEnabled, reminderAdvanceDays: advanceDays })
      Taro.setStorageSync('app_settings', { showHomeSummary, showEmptyReminders, compactList })
      if (res.success) {
        if (res.data) useAuthStore.getState().setUser(res.data)
        Taro.showToast({ title: '保存成功', icon: 'success' })
      } else {
        Taro.showToast({ title: res.error || '保存失败', icon: 'none' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      confirmColor: '#D84A4A',
      success: (res) => {
        if (!res.confirm) return
        logout()
        Taro.switchTab({ url: '/pages/index/index' })
      },
    })
  }

  return (
    <View className="page-container settings-page">
      <View className="settings-hero">
        <Text className="hero-kicker">应用设置</Text>
        <Text className="hero-title">管理提醒和使用偏好</Text>
        <Text className="hero-desc">账号提醒会同步到后台，页面展示偏好保存在当前设备。</Text>
      </View>

      <View className="settings-section">
        <Text className="settings-header">提醒设置</Text>
        <View className="settings-item">
          <View className="settings-item-left">
            <Text className="settings-item-title">开启提醒</Text>
            <Text className="settings-item-desc">关闭后将不再收到任何提醒</Text>
          </View>
          <Switch checked={reminderEnabled} onChange={(event) => setReminderEnabled(event.detail.value)} color="#2F6B5F" />
        </View>
        {reminderEnabled && (
          <View className="settings-item settings-slider-item">
            <View className="settings-item-full">
              <View className="settings-item-row">
                <Text className="settings-item-title">提前提醒天数</Text>
                <Text className="settings-item-value">{advanceDays} 天</Text>
              </View>
              <Slider
                value={advanceDays}
                min={1}
                max={30}
                step={1}
                onChange={(event) => setAdvanceDays(event.detail.value)}
                activeColor="#2F6B5F"
                blockColor="#2F6B5F"
                blockSize={20}
                style={{ marginTop: '16rpx' }}
              />
              <View className="slider-range"><Text>1 天</Text><Text>30 天</Text></View>
            </View>
          </View>
        )}
      </View>

      <View className="settings-section">
        <Text className="settings-header">首页与功能开关</Text>
        <View className="settings-item">
          <View className="settings-item-left">
            <Text className="settings-item-title">首页总览</Text>
            <Text className="settings-item-desc">展示宠物、库存和到期统计</Text>
          </View>
          <Switch checked={showHomeSummary} onChange={(event) => setShowHomeSummary(event.detail.value)} color="#2F6B5F" />
        </View>
        <View className="settings-item">
          <View className="settings-item-left">
            <Text className="settings-item-title">空提醒提示</Text>
            <Text className="settings-item-desc">没有待办时仍显示提醒区域</Text>
          </View>
          <Switch checked={showEmptyReminders} onChange={(event) => setShowEmptyReminders(event.detail.value)} color="#2F6B5F" />
        </View>
        <View className="settings-item">
          <View className="settings-item-left">
            <Text className="settings-item-title">紧凑列表</Text>
            <Text className="settings-item-desc">预留列表密度和长数据展示偏好</Text>
          </View>
          <Switch checked={compactList} onChange={(event) => setCompactList(event.detail.value)} color="#2F6B5F" />
        </View>
      </View>

      <View className="settings-section data-note">
        <Text className="settings-header">数据说明</Text>
        <Text className="settings-desc">小程序与网页端将共用同一套后台数据。微信登录、邮箱登录和会员状态通过统一账号体系同步。</Text>
      </View>

      <Button className="save-btn ui-primary-btn" onClick={handleSave} loading={saving} disabled={saving}>
        保存设置
      </Button>
      <View className="logout-btn" onClick={handleLogout}>退出登录</View>
    </View>
  )
}

export default SettingsPage
