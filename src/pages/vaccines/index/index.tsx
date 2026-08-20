import React, { useCallback, useMemo, useState } from 'react'
import { Input, View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { vaccinesApi } from '@/services/health'
import { useAuth } from '@/hooks'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import AppHeader from '@/components/AppHeader'
import type { Vaccine } from '@/types'
import './index.scss'

type VaccineFilter = 'all' | 'reminderOn' | 'reminderOff'

const formatDate = (value?: string) => value ? value.slice(0, 10) : '-'

const VaccinesPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const { guardFeature } = useFeatureGate()
  const [list, setList] = useState<Vaccine[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VaccineFilter>('all')

  const fetchData = useCallback(async () => {
    if (!(await guardFeature('vaccine'))) {
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
    if (filter === 'reminderOn') params.status = 'reminderOn'
    if (filter === 'reminderOff') params.status = 'reminderOff'
    const res = await vaccinesApi.getList(params)
    if (res.success && res.data) setList(res.data)
    setLoading(false)
  }, [filter, search, requireAuth, guardFeature])

  useDidShow(() => { fetchData() })

  const stats = useMemo(() => {
    const reminderOn = list.filter((item) => item.reminderEnabled).length
    const upcoming = list.filter((item) => Boolean(item.nextVaccinationDate)).length
    return { total: list.length, reminderOn, upcoming }
  }, [list])

  const filters: Array<{ key: VaccineFilter; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'reminderOn', label: '提醒开启' },
    { key: 'reminderOff', label: '提醒关闭' },
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
    <View className="page-container vaccines-page">
      <AppHeader />
      <View className="vaccines-hero">
        <View>
          <Text className="hero-kicker">疫苗管理</Text>
          <Text className="hero-title">记录接种和下次提醒</Text>
        </View>
        <View className="hero-action" onClick={() => Taro.navigateTo({ url: '/pages/vaccines/add/index' })}>添加</View>
      </View>

      <View className="stats-strip">
        <View className="stat-pill">
          <Text className="stat-value">{stats.total}</Text>
          <Text className="stat-label">记录</Text>
        </View>
        <View className="stat-pill">
          <Text className="stat-value">{stats.upcoming}</Text>
          <Text className="stat-label">下次提醒</Text>
        </View>
        <View className="stat-pill">
          <Text className="stat-value">{stats.reminderOn}</Text>
          <Text className="stat-label">提醒开启</Text>
        </View>
      </View>

      <View className="search-bar">
        <Text className="search-icon">⌕</Text>
        <Input
          className="search-input"
          value={search}
          placeholder="搜索疫苗、医院或医生"
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
          icon="苗"
          title="暂无疫苗记录"
          description="记录宠物接种时间、医院、医生和下一次提醒。"
          actionText="添加疫苗"
          onAction={() => Taro.navigateTo({ url: '/pages/vaccines/add/index' })}
        />
      ) : (
        <View className="vaccine-list">
          {list.map((item) => (
            <View key={item.id} className="vaccine-card" onClick={() => Taro.navigateTo({ url: `/pages/vaccines/detail/index?id=${item.id}` })}>
              <View className="vaccine-icon">苗</View>
              <View className="vaccine-content">
                <View className="vaccine-header">
                  <Text className="vaccine-title">{item.vaccineName}</Text>
                  <Text className={`reminder-chip ${item.reminderEnabled ? 'active' : ''}`}>
                    {item.reminderEnabled ? '提醒开启' : '提醒关闭'}
                  </Text>
                </View>
                <View className="vaccine-meta">
                  <Text>{item.pet?.name || '未关联宠物'}</Text>
                  <Text className="dot">·</Text>
                  <Text>接种 {formatDate(item.vaccinationDate)}</Text>
                </View>
                <View className="vaccine-meta">
                  <Text>{item.hospital || item.veterinarian || '医院未填'}</Text>
                  <Text className="dot">·</Text>
                  <Text>{item.doctor || '医生未填'}</Text>
                </View>
                <View className="vaccine-next">
                  {item.nextVaccinationDate ? `下次接种 ${formatDate(item.nextVaccinationDate)}` : '未设置下次接种'}
                </View>
              </View>
              <Text className="vaccine-arrow">›</Text>
            </View>
          ))}
        </View>
      )}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/vaccines/add/index' })}>
        <Text className="fab-text">+</Text>
      </View>
    </View>
  )
}

export default VaccinesPage
