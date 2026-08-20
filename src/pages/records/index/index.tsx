import React, { useCallback, useMemo, useState } from 'react'
import { Input, ScrollView, Text, View } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { recordsApi } from '@/services/health'
import { useAuth } from '@/hooks'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { HealthRecord } from '@/types'
import './index.scss'

type RecordFilter = 'all' | 'weight' | 'temperature' | 'symptom' | 'checkup' | 'treatment' | 'other'

const RECORD_TYPE_LABEL: Record<string, string> = {
  weight: '体重',
  temperature: '体温',
  symptom: '症状',
  checkup: '体检',
  treatment: '治疗',
  other: '其他',
}

const RECORD_TYPE_ICON: Record<string, string> = {
  weight: '重',
  temperature: '温',
  symptom: '症',
  checkup: '检',
  treatment: '治',
  other: '记',
}

const formatDate = (value?: string) => value ? value.slice(0, 10) : '-'

const RecordsPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const [list, setList] = useState<HealthRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RecordFilter>('all')

  const fetchData = useCallback(async () => {
    if (!requireAuth()) {
      setLoading(false)
      return
    }

    setLoading(true)
    const params: Record<string, string> = {}
    if (search.trim()) params.search = search.trim()
    if (filter !== 'all') params.type = filter
    const res = await recordsApi.getList(params)
    if (res.success && res.data) setList(res.data)
    setLoading(false)
  }, [filter, search, requireAuth])

  useDidShow(() => { fetchData() })

  const stats = useMemo(() => ({
    total: list.length,
    weight: list.filter((item) => item.recordType === 'weight').length,
    checkup: list.filter((item) => item.recordType === 'checkup').length,
    mediaReserved: list.filter((item) => item.imageReserved || item.mediaUrls?.length).length,
  }), [list])

  const filters: Array<{ key: RecordFilter; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'weight', label: '体重' },
    { key: 'temperature', label: '体温' },
    { key: 'symptom', label: '症状' },
    { key: 'checkup', label: '体检' },
    { key: 'treatment', label: '治疗' },
    { key: 'other', label: '其他' },
  ]

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  return (
    <View className="page-container records-page">
      <View className="records-hero">
        <View>
          <Text className="hero-kicker">健康记录</Text>
          <Text className="hero-title">沉淀每一次健康变化</Text>
        </View>
        <View className="hero-action" onClick={() => Taro.navigateTo({ url: '/pages/records/detail/index?id=new' })}>添加</View>
      </View>

      <View className="stats-strip">
        <View className="stat-pill"><Text className="stat-value">{stats.total}</Text><Text className="stat-label">全部记录</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.weight}</Text><Text className="stat-label">体重记录</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.checkup}</Text><Text className="stat-label">体检记录</Text></View>
        <View className="stat-pill"><Text className="stat-value">{stats.mediaReserved}</Text><Text className="stat-label">图片预留</Text></View>
      </View>

      <View className="search-bar">
        <Text className="search-icon">搜</Text>
        <Input
          className="search-input"
          value={search}
          placeholder="搜索记录、宠物或摘要"
          confirmType="search"
          onInput={(event) => setSearch(event.detail.value)}
          onConfirm={fetchData}
        />
      </View>

      <ScrollView className="filter-scroll" scrollX enableFlex>
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
      </ScrollView>

      {list.length === 0 ? (
        <EmptyState
          icon="记"
          title="暂无健康记录"
          description="记录体重、体温、症状、体检和治疗结果，方便长期回顾。"
          actionText="添加记录"
          onAction={() => Taro.navigateTo({ url: '/pages/records/detail/index?id=new' })}
        />
      ) : (
        <View className="record-list">
          {list.map((record) => (
            <View
              key={record.id}
              className="record-card"
              onClick={() => Taro.navigateTo({ url: `/pages/records/detail/index?id=${record.id}` })}
            >
              <View className={`record-icon record-icon-${record.recordType}`}>
                {RECORD_TYPE_ICON[record.recordType] || '记'}
              </View>
              <View className="record-content">
                <View className="record-header">
                  <Text className="record-type">{RECORD_TYPE_LABEL[record.recordType] || '其他'}</Text>
                  <Text className="record-date">{formatDate(record.recordDate)}</Text>
                </View>
                <Text className="record-pet">{record.pet?.name || '未关联宠物'}</Text>
                {record.value && <Text className="record-value">{record.value}</Text>}
                <Text className="record-note">{record.notes || '未填写健康摘要'}</Text>
              </View>
              <View className="record-side">
                {(record.imageReserved || record.mediaUrls?.length) && <Text className="media-chip">图</Text>}
                <Text className="record-arrow">›</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/records/detail/index?id=new' })}>
        <Text className="fab-text">+</Text>
      </View>
    </View>
  )
}

export default RecordsPage
