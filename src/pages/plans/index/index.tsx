import React, { useCallback, useMemo, useState } from 'react'
import { Input, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { plansApi } from '@/services/health'
import { useAuth } from '@/hooks'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { HealthPlan } from '@/types'
import './index.scss'

type PlanStatus = 'all' | 'active' | 'paused' | 'completed'

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
  paused: '已暂停',
  completed: '已完成',
}

const formatDate = (value?: string) => value ? value.slice(0, 10) : '-'

const PlansPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const [list, setList] = useState<HealthPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PlanStatus>('all')

  const fetchData = useCallback(async () => {
    if (!requireAuth()) {
      setLoading(false)
      return
    }

    setLoading(true)
    const params: Record<string, string> = {}
    if (search.trim()) params.search = search.trim()
    if (filter !== 'all') params.status = filter
    const res = await plansApi.getList(params)
    if (res.success && res.data) setList(res.data)
    setLoading(false)
  }, [filter, search, requireAuth])

  useDidShow(() => { fetchData() })

  const stats = useMemo(() => ({
    total: list.length,
    active: list.filter((item) => (item.status || 'active') === 'active').length,
    due: list.filter((item) => Boolean(item.nextDueDate)).length,
    completed: list.filter((item) => item.status === 'completed').length,
  }), [list])

  const filters: Array<{ key: PlanStatus; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'paused', label: '已暂停' },
    { key: 'completed', label: '已完成' },
  ]

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  return (
    <View className="page-container plans-page">
      <View className="plans-hero">
        <View>
          <Text className="hero-kicker">健康计划</Text>
          <Text className="hero-title">把日常照护安排成计划</Text>
        </View>
        <View className="hero-action" onClick={() => Taro.navigateTo({ url: '/pages/plans/add/index' })}>新建</View>
      </View>

      <View className="stats-strip">
        <View className="stat-pill"><Text className="stat-value">{stats.total}</Text><Text className="stat-label">全部计划</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.active}</Text><Text className="stat-label">进行中</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.due}</Text><Text className="stat-label">待执行</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.completed}</Text><Text className="stat-label">已完成</Text></View>
      </View>

      <View className="search-bar">
        <Text className="search-icon">搜</Text>
        <Input
          className="search-input"
          value={search}
          placeholder="搜索计划名称或宠物"
          confirmType="search"
          onInput={(event) => setSearch(event.detail.value)}
          onConfirm={fetchData}
        />
      </View>

      <View className="filter-bar">
        {filters.map((item) => (
          <View
            key={item.key}
            className={`filter-tag ${filter === item.key ? 'active' : ''}`}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </View>
        ))}
      </View>

      {list.length === 0 ? (
        <EmptyState
          icon="计"
          title="暂无健康计划"
          description="把疫苗、驱虫、体检和护理安排成周期计划，到期前及时提醒。"
          actionText="新建计划"
          onAction={() => Taro.navigateTo({ url: '/pages/plans/add/index' })}
        />
      ) : (
        <View className="plan-list">
          {list.map((plan) => {
            const status = plan.status || 'active'
            const progress = plan.totalCount > 0 ? `${plan.completedCount}/${plan.totalCount}` : '未设次数'
            const frequency = plan.frequency === 'custom' && plan.customDays
              ? `每 ${plan.customDays} 天`
              : FREQUENCY_LABEL[plan.frequency] || plan.frequency

            return (
              <View
                key={plan.id}
                className="plan-card"
                onClick={() => Taro.navigateTo({ url: `/pages/plans/detail/index?id=${plan.id}` })}
              >
                <View className={`plan-icon plan-icon-${plan.planType}`}>计</View>
                <View className="plan-content">
                  <View className="plan-header">
                    <Text className="plan-title">{plan.planName}</Text>
                    <Text className={`status-chip status-${status}`}>{STATUS_LABEL[status] || '进行中'}</Text>
                  </View>
                  <View className="plan-meta">
                    <Text>{plan.pet?.name || '未关联宠物'}</Text>
                    <Text className="dot">·</Text>
                    <Text>{PLAN_TYPE_LABEL[plan.planType] || '其他'}</Text>
                    <Text className="dot">·</Text>
                    <Text>{frequency}</Text>
                  </View>
                  <View className="plan-progress-row">
                    <Text className="plan-progress">已完成 {progress} 次</Text>
                    <Text className="plan-next">{plan.nextDueDate ? `下次 ${formatDate(plan.nextDueDate)}` : '暂未生成下次时间'}</Text>
                  </View>
                </View>
                <Text className="plan-arrow">›</Text>
              </View>
            )
          })}
        </View>
      )}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/plans/add/index' })}>
        <Text className="fab-text">+</Text>
      </View>
    </View>
  )
}

export default PlansPage
