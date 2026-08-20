import React, { useCallback, useMemo, useState } from 'react'
import { Input, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { medicationsApi } from '@/services/health'
import { useAuth } from '@/hooks'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import AppHeader from '@/components/AppHeader'
import type { Medication } from '@/types'
import './index.scss'

type MedicationFilter = 'all' | 'deworming' | 'treatment' | 'supplement' | 'other'

const TYPE_LABEL: Record<string, string> = {
  deworming: '驱虫',
  treatment: '治疗',
  supplement: '营养补充',
  other: '其他',
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: '每天',
  weekly: '每周',
  biweekly: '每两周',
  monthly: '每月',
  quarterly: '每季度',
  yearly: '每年',
  custom: '自定义',
}

const formatDate = (value?: string) => value ? value.slice(0, 10) : '-'

const MedicationsPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const { guardFeature } = useFeatureGate()
  const [list, setList] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<MedicationFilter>('all')

  const fetchData = useCallback(async () => {
    if (!(await guardFeature('medication'))) {
      setLoading(false)
      return
    }
    if (!requireAuth()) {
      setLoading(false)
      return
    }

    setLoading(true)
    const params: Record<string, string> = {}
    if (search.trim()) params.search = search.trim()
    if (filter !== 'all') params.type = filter
    const res = await medicationsApi.getList(params)
    if (res.success && res.data) setList(res.data)
    setLoading(false)
  }, [filter, search, requireAuth, guardFeature])

  useDidShow(() => { fetchData() })

  const stats = useMemo(() => ({
    total: list.length,
    reminderOn: list.filter((item) => item.reminderEnabled).length,
    nextDose: list.filter((item) => Boolean(item.nextDoseDate)).length,
    deworming: list.filter((item) => item.type === 'deworming').length,
  }), [list])

  const filters: Array<{ key: MedicationFilter; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'deworming', label: '驱虫' },
    { key: 'treatment', label: '治疗' },
    { key: 'supplement', label: '营养补充' },
    { key: 'other', label: '其他' },
  ]

  if (loading) {
    return (
      <View className="page-container">
        <AppHeader />
        <Loading fullPage />
      </View>
    )
  }

  return (
    <View className="page-container medications-page">
      <AppHeader />
      <View className="medications-hero">
        <View>
          <Text className="hero-kicker">用药管理</Text>
          <Text className="hero-title">追踪驱虫和日常用药</Text>
        </View>
        <View className="hero-action" onClick={() => Taro.navigateTo({ url: '/pages/medications/add/index' })}>添加</View>
      </View>

      <View className="stats-strip">
        <View className="stat-pill"><Text className="stat-value">{stats.total}</Text><Text className="stat-label">记录</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.nextDose}</Text><Text className="stat-label">下次用药</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.reminderOn}</Text><Text className="stat-label">提醒开启</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.deworming}</Text><Text className="stat-label">驱虫</Text></View>
      </View>

      <View className="search-bar">
        <Text className="search-icon">搜</Text>
        <Input
          className="search-input"
          value={search}
          placeholder="搜索药品、用途或宠物"
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
          icon="药"
          title="暂无用药记录"
          description="记录宠物驱虫、治疗用药和营养补充，并设置下次用药提醒。"
          actionText="添加用药"
          onAction={() => Taro.navigateTo({ url: '/pages/medications/add/index' })}
        />
      ) : (
        <View className="med-list">
          {list.map((item) => (
            <View
              key={item.id}
              className="med-card"
              onClick={() => Taro.navigateTo({ url: `/pages/medications/detail/index?id=${item.id}` })}
            >
              <View className={`med-icon med-icon-${item.type}`}>药</View>
              <View className="med-content">
                <View className="med-header">
                  <Text className="med-title">{item.medicationName}</Text>
                  <Text className={`type-chip type-${item.type}`}>{TYPE_LABEL[item.type] || '其他'}</Text>
                </View>
                <View className="med-meta">
                  <Text>{item.pet?.name || '未关联宠物'}</Text>
                  <Text className="dot">·</Text>
                  <Text>{item.purpose || '用途未填写'}</Text>
                </View>
                <View className="med-meta">
                  <Text>剂量 {item.dosage || '-'}</Text>
                  <Text className="dot">·</Text>
                  <Text>
                    {FREQUENCY_LABEL[item.frequency || ''] || item.frequency || '-'}
                    {item.frequencyDays ? ` / ${item.frequencyDays}天` : ''}
                  </Text>
                </View>
                <Text className="med-next">
                  {item.nextDoseDate ? `下次用药 ${formatDate(item.nextDoseDate)}` : '未设置下次用药'}
                </Text>
              </View>
              <Text className={`reminder-dot ${item.reminderEnabled ? 'active' : ''}`} />
              <Text className="med-arrow">›</Text>
            </View>
          ))}
        </View>
      )}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/medications/add/index' })}>
        <Text className="fab-text">+</Text>
      </View>
    </View>
  )
}

export default MedicationsPage
