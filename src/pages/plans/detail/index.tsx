import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { plansApi } from '@/services/health'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { HealthPlan } from '@/types'
import './index.scss'

const PLAN_TYPE_LABEL: Record<string, string> = {
  vaccine: '疫苗',
  deworming: '驱虫',
  checkup: '体检',
  grooming: '护理',
  other: '其他',
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
  monthly: '每月',
  quarterly: '每季度',
  yearly: '每年',
  custom: '自定义',
}

const STATUS_LABEL: Record<string, string> = {
  active: '进行中',
  completed: '已完成',
  paused: '已暂停',
}

const formatDate = (value?: string) => value ? value.slice(0, 10) : '-'

const PlanDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id || ''
  const [data, setData] = useState<HealthPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    plansApi.getDetail(id).then((res) => {
      if (res.success && res.data) {
        setData(res.data)
      } else {
        Taro.showToast({ title: res.error || '健康计划加载失败', icon: 'none' })
      }
      setLoading(false)
    })
  }, [id])

  const handleDelete = () => {
    Taro.showModal({
      title: '删除健康计划',
      content: `确定删除“${data?.planName || '当前计划'}”吗？`,
      confirmColor: '#D84A4A',
      success: async (res) => {
        if (!res.confirm) return
        const del = await plansApi.delete(id)
        if (del.success) {
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 500)
        } else {
          Taro.showToast({ title: del.error || '删除失败', icon: 'none' })
        }
      },
    })
  }

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  if (!data) {
    return (
      <View className="page-container">
        <EmptyState title="计划不存在" description="该健康计划可能已删除或暂时无访问权限。" />
      </View>
    )
  }

  const status = data.status || 'active'
  const typeLabel = PLAN_TYPE_LABEL[data.planType] || '其他'
  const frequencyText = data.frequency === 'custom' && data.customDays
    ? `每 ${data.customDays} 天`
    : FREQUENCY_LABEL[data.frequency] || data.frequency
  const reminderMethod = data.reminderMethod === 'inApp' ? '站内信提醒' : '小程序提醒'
  const progressText = data.totalCount > 0
    ? `${data.completedCount} / ${data.totalCount} 次`
    : `${data.completedCount} 次`
  const infoRows = [
    { label: '宠物', value: data.pet?.name || '-' },
    { label: '目标类型', value: typeLabel },
    { label: '重复规则', value: frequencyText },
    { label: '开始时间', value: formatDate(data.startDate) },
    { label: '结束时间', value: formatDate(data.endDate) },
    { label: '提醒方式', value: data.reminderEnabled ? reminderMethod : '提醒关闭' },
    { label: '提前天数', value: data.reminderEnabled ? `${data.reminderDays || 7} 天` : '-' },
    { label: '备注', value: data.notes || '-' },
  ]

  return (
    <View className="page-container plan-detail-page">
      <View className="detail-hero">
        <View className={`detail-icon detail-icon-${data.planType}`}>计</View>
        <View className="detail-main">
          <Text className="detail-title">{data.planName}</Text>
          <Text className="detail-subtitle">{data.pet?.name || '未关联宠物'} · {typeLabel}</Text>
          <View className="status-row">
            <Text className={`status-pill status-${status}`}>{STATUS_LABEL[status] || '进行中'}</Text>
            {data.nextDueDate && <Text className="status-pill warn">下次 {formatDate(data.nextDueDate)}</Text>}
          </View>
        </View>
      </View>

      <View className="detail-card">
        <Text className="card-title">计划信息</Text>
        {infoRows.map((item) => (
          <View className="info-row" key={item.label}>
            <Text className="info-label">{item.label}</Text>
            <Text className="info-value">{item.value}</Text>
          </View>
        ))}
      </View>

      <View className="detail-card timeline-card">
        <Text className="card-title">执行状态</Text>
        <View className="progress-panel">
          <Text className="progress-value">{progressText}</Text>
          <Text className="progress-label">已完成次数</Text>
        </View>
        <View className="timeline-item">
          <Text className="timeline-dot" />
          <Text className="timeline-text">
            {data.lastCompletedAt ? `${formatDate(data.lastCompletedAt)} 最近完成` : '暂未记录完成动作'}
          </Text>
        </View>
        <View className="timeline-item muted">
          <Text className="timeline-dot" />
          <Text className="timeline-text">
            {data.nextDueDate ? `${formatDate(data.nextDueDate)} 下次执行` : '暂未生成下次执行时间'}
          </Text>
        </View>
      </View>

      <View className="action-row">
        <Button className="action-btn primary" onClick={() => Taro.navigateTo({ url: `/pages/plans/add/index?id=${data.id}` })}>
          编辑
        </Button>
        <Button className="action-btn danger" onClick={handleDelete}>删除</Button>
      </View>
    </View>
  )
}

export default PlanDetailPage
