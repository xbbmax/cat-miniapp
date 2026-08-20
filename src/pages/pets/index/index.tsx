import React, { useCallback, useMemo, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { petsApi } from '@/services/pets'
import { useAuth } from '@/hooks'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import AppHeader from '@/components/AppHeader'
import type { Pet } from '@/types'
import './index.scss'

const PET_TYPE_ICONS: Record<string, string> = {
  cat: '猫',
  dog: '狗',
  rabbit: '兔',
  bird: '鸟',
  hamster: '仓',
  turtle: '龟',
  fish: '鱼',
  other: '宠',
}

const PET_TYPE_LABELS: Record<string, string> = {
  cat: '猫咪',
  dog: '狗狗',
  rabbit: '兔子',
  bird: '鸟类',
  hamster: '仓鼠',
  turtle: '乌龟',
  fish: '鱼类',
  other: '其他',
}

const GENDER_LABELS: Record<string, string> = {
  male: '公',
  female: '母',
  unknown: '未知',
}

const PetListPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const { guardFeature } = useFeatureGate()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchPets = useCallback(async () => {
    if (!(await guardFeature('pet'))) {
      setLoading(false)
      return
    }
    if (!requireAuth()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await petsApi.getList({ search })
      if (res.success && res.data) setPets(res.data)
    } finally {
      setLoading(false)
    }
  }, [search, requireAuth, guardFeature])

  useDidShow(() => { fetchPets() })

  const petStats = useMemo(() => {
    const withBirthday = pets.filter((pet) => Boolean(pet.birthday)).length
    const withHealthNote = pets.filter((pet) => Boolean(pet.allergies || pet.chronicConditions || pet.longTermMedication)).length
    return { total: pets.length, withBirthday, withHealthNote }
  }, [pets])

  if (loading) {
    return (
      <View className="page-container">
        <AppHeader />
        <Loading fullPage />
      </View>
    )
  }

  return (
    <View className="page-container pets-page">
      <AppHeader />
      <View className="pets-hero">
        <View>
          <Text className="hero-kicker">宠物档案</Text>
          <Text className="hero-title">管理每只宠物的健康基础信息</Text>
        </View>
        <View className="hero-action" onClick={() => Taro.navigateTo({ url: '/pages/pets/add/index' })}>添加</View>
      </View>

      <View className="stats-strip">
        <View className="stat-pill">
          <Text className="stat-value">{petStats.total}</Text>
          <Text className="stat-label">宠物</Text>
        </View>
        <View className="stat-pill">
          <Text className="stat-value">{petStats.withBirthday}</Text>
          <Text className="stat-label">已填生日</Text>
        </View>
        <View className="stat-pill">
          <Text className="stat-value">{petStats.withHealthNote}</Text>
          <Text className="stat-label">健康备注</Text>
        </View>
      </View>

      <View className="search-bar">
        <Text className="search-icon">⌕</Text>
        <Input
          className="search-input"
          value={search}
          placeholder="搜索宠物名称或品种"
          onInput={(event) => setSearch(event.detail.value)}
          confirmType="search"
          onConfirm={fetchPets}
        />
      </View>

      {pets.length === 0 ? (
        <EmptyState
          icon="宠"
          title="还没有宠物档案"
          description="先添加宠物，再记录疫苗、用药、产品效期和健康计划。"
          actionText="添加宠物"
          onAction={() => Taro.navigateTo({ url: '/pages/pets/add/index' })}
        />
      ) : (
        <View className="pet-list">
          {pets.map((pet) => (
            <View
              key={pet.id}
              className="pet-card"
              onClick={() => Taro.navigateTo({ url: `/pages/pets/detail/index?id=${pet.id}` })}
            >
              <View className={`pet-avatar pet-avatar-${pet.type}`}>
                {PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS.other}
              </View>
              <View className="pet-info">
                <View className="pet-title-row">
                  <Text className="pet-name">{pet.name}</Text>
                  <Text className={`gender-chip gender-${pet.gender}`}>{GENDER_LABELS[pet.gender]}</Text>
                </View>
                <View className="pet-meta">
                  <Text>{pet.breed || PET_TYPE_LABELS[pet.type] || '未填写品种'}</Text>
                  <Text className="dot">·</Text>
                  <Text>{PET_TYPE_LABELS[pet.type] || '其他'}</Text>
                </View>
                <View className="pet-extra">
                  <Text>{pet.birthday ? `生日 ${pet.birthday}` : '生日未填'}</Text>
                  <Text>{pet.weight ? `体重 ${pet.weight}kg` : '体重未填'}</Text>
                </View>
              </View>
              <Text className="pet-arrow">›</Text>
            </View>
          ))}
        </View>
      )}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/pets/add/index' })}>
        <Text className="fab-text">+</Text>
      </View>
    </View>
  )
}

export default PetListPage
