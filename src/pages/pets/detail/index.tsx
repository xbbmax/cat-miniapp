import React, { useEffect, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { petsApi } from '@/services/pets'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { Pet } from '@/types'
import './index.scss'

const PET_TYPE_MAP: Record<string, string> = {
  cat: '猫咪',
  dog: '狗狗',
  rabbit: '兔子',
  bird: '鸟类',
  hamster: '仓鼠',
  turtle: '乌龟',
  fish: '鱼类',
  other: '其他',
}

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

const GENDER_MAP: Record<string, string> = {
  male: '公',
  female: '母',
  unknown: '未知',
}

const PetDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id || ''
  const [pet, setPet] = useState<Pet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    petsApi.getDetail(id).then((res) => {
      if (res.success && res.data) setPet(res.data)
      setLoading(false)
    })
  }, [id])

  const handleDelete = () => {
    Taro.showModal({
      title: '删除宠物',
      content: `确定要删除「${pet?.name}」吗？删除后不可恢复。`,
      confirmColor: '#D84A4A',
      success: async (res) => {
        if (res.confirm) {
          const del = await petsApi.delete(id)
          if (del.success) {
            Taro.showToast({ title: '已删除', icon: 'success' })
            setTimeout(() => Taro.navigateBack(), 500)
          } else {
            Taro.showToast({ title: del.error || '删除失败', icon: 'none' })
          }
        }
      },
    })
  }

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  if (!pet) {
    return (
      <View className="page-container">
        <EmptyState title="宠物信息不存在" description="该宠物可能已删除或暂无访问权限。" />
      </View>
    )
  }

  const basics = [
    { label: '品种', value: pet.breed || '-' },
    { label: '性别', value: GENDER_MAP[pet.gender] || '未知' },
    { label: '生日', value: pet.birthday || '-' },
    { label: '体重', value: pet.weight ? `${pet.weight} kg` : '-' },
    { label: '绝育', value: pet.isNeutered ? '已绝育' : '未绝育/未填写' },
  ]

  const health = [
    { label: '过敏情况', value: pet.allergies || '未填写' },
    { label: '慢病情况', value: pet.chronicConditions || '未填写' },
    { label: '长期用药', value: pet.longTermMedication || '未填写' },
    { label: '特殊护理', value: pet.specialCare || '未填写' },
    { label: '备注', value: pet.notes || '未填写' },
  ]

  const links = [
    { label: '疫苗', desc: '接种与下次提醒', icon: '苗', url: '/pages/vaccines/index/index', tab: true },
    { label: '用药', desc: '驱虫和日常用药', icon: '药', url: '/pages/medications/index/index', tab: true },
    { label: '计划', desc: '周期性健康事项', icon: '计', url: `/pages/plans/index/index?petId=${pet.id}` },
    { label: '记录', desc: '体重、检查和护理', icon: '记', url: `/pages/records/index/index?petId=${pet.id}` },
  ]

  return (
    <View className="page-container pet-detail-page">
      <View className="detail-hero">
        <View className={`detail-avatar avatar-${pet.type}`}>
          {PET_TYPE_ICONS[pet.type] || PET_TYPE_ICONS.other}
        </View>
        <View className="detail-main">
          <Text className="detail-name">{pet.name}</Text>
          <Text className="detail-subtitle">{PET_TYPE_MAP[pet.type] || '其他'} · {pet.breed || '品种未填写'}</Text>
        </View>
      </View>

      <View className="action-row">
        <Button className="action-btn primary" onClick={() => Taro.navigateTo({ url: `/pages/pets/add/index?id=${pet.id}` })}>
          编辑信息
        </Button>
        <Button className="action-btn danger" onClick={handleDelete}>删除</Button>
      </View>

      <View className="detail-card">
        <Text className="card-title">基础资料</Text>
        {basics.map((item) => (
          <View className="info-item" key={item.label}>
            <Text className="info-label">{item.label}</Text>
            <Text className="info-value">{item.value}</Text>
          </View>
        ))}
      </View>

      <View className="detail-card">
        <Text className="card-title">健康备注</Text>
        {health.map((item) => (
          <View className="info-item multiline" key={item.label}>
            <Text className="info-label">{item.label}</Text>
            <Text className="info-value">{item.value}</Text>
          </View>
        ))}
      </View>

      <Text className="section-title">关联管理</Text>
      <View className="link-grid">
        {links.map((item) => (
          <View
            key={item.label}
            className="link-card"
            onClick={() => {
              if (item.tab) {
                Taro.switchTab({ url: item.url })
              } else {
                Taro.navigateTo({ url: item.url })
              }
            }}
          >
            <View className="link-icon">{item.icon}</View>
            <View className="link-copy">
              <Text className="link-label">{item.label}</Text>
              <Text className="link-desc">{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default PetDetailPage
