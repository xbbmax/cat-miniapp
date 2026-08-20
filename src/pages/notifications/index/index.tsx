import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { notificationsApi } from '@/services/notifications'
import { useAuth } from '@/hooks'
import { useAppStore } from '@/store/app'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { Notification } from '@/types'
import './index.scss'

const TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  product_expiry: { icon: '期', label: '产品效期' },
  vaccine_reminder: { icon: '苗', label: '疫苗提醒' },
  medication_reminder: { icon: '药', label: '用药提醒' },
  plan_reminder: { icon: '计', label: '计划提醒' },
  system: { icon: '系', label: '系统通知' },
}

const NotificationsPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const [list, setList] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { setUnreadCount } = useAppStore()

  const fetchNotifications = useCallback(async () => {
    if (!requireAuth()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await notificationsApi.getList({ pageSize: 50 })
      if (res.success && res.data) setList(res.data)
    } catch {
      // Keep current notifications when refresh fails.
    } finally {
      setLoading(false)
    }
  }, [requireAuth])

  useDidShow(() => { fetchNotifications() })

  const unreadCount = useMemo(() => list.filter((item) => !item.isRead).length, [list])

  const handleMarkAllRead = useCallback(async () => {
    const res = await notificationsApi.markAllAsRead()
    if (res.success) {
      setList((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
      Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
    }
  }, [setUnreadCount])

  const handleItemClick = useCallback(async (item: Notification) => {
    if (!item.isRead) {
      await notificationsApi.markAsRead(item.id)
      setList((prev) => prev.map((current) => current.id === item.id ? { ...current, isRead: true } : current))
      const countRes = await notificationsApi.getUnreadCount()
      if (countRes.success && countRes.data) setUnreadCount(countRes.data.count)
    }
  }, [setUnreadCount])

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  return (
    <View className="page-container notifications-page">
      <View className="notify-hero">
        <View>
          <Text className="hero-kicker">通知中心</Text>
          <Text className="hero-title">宠物健康事项提醒</Text>
        </View>
        <View className="unread-card">
          <Text className="unread-value">{unreadCount}</Text>
          <Text className="unread-label">未读</Text>
        </View>
      </View>

      <View className="notify-actions">
        <Text className="notify-summary">共 {list.length} 条通知</Text>
        {unreadCount > 0 && (
          <Text className="mark-all-read" onClick={handleMarkAllRead}>全部已读</Text>
        )}
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon="知"
          title="暂无通知"
          description="产品临期、疫苗到期、用药和健康计划提醒会显示在这里。"
        />
      ) : (
        <ScrollView className="notify-list" scrollY>
          {list.map((item) => {
            const typeInfo = TYPE_LABELS[item.type] || TYPE_LABELS.system
            return (
              <View
                key={item.id}
                className={`notify-item ${!item.isRead ? 'unread' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                <View className="notify-icon-wrap">
                  <Text className="notify-icon">{typeInfo.icon}</Text>
                  {!item.isRead && <View className="notify-dot" />}
                </View>
                <View className="notify-content">
                  <View className="notify-title-row">
                    <Text className="notify-title">{item.title}</Text>
                    <Text className="notify-type">{typeInfo.label}</Text>
                  </View>
                  <Text className="notify-desc">{item.message}</Text>
                  <Text className="notify-time">{new Date(item.createdAt).toLocaleString('zh-CN')}</Text>
                </View>
              </View>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

export default NotificationsPage
