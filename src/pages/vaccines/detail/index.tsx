import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { vaccinesApi } from '@/services/health'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { Vaccine } from '@/types'
import './index.scss'

const formatDate = (value?: string) => value ? value.slice(0, 10) : '-'

const VaccineDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id || ''
  const [data, setData] = useState<Vaccine | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vaccinesApi.getDetail(id).then((res) => {
      if (res.success && res.data) setData(res.data)
      setLoading(false)
    })
  }, [id])

  const handleDelete = () => {
    Taro.showModal({
      title: '删除疫苗记录',
      content: `确定删除「${data?.vaccineName || '当前记录'}」吗？`,
      confirmColor: '#D84A4A',
      success: async (res) => {
        if (!res.confirm) return
        const del = await vaccinesApi.delete(id)
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
        <EmptyState title="记录不存在" description="该疫苗记录可能已删除或暂无访问权限。" />
      </View>
    )
  }

  const infoRows = [
    { label: '宠物', value: data.pet?.name || '-' },
    { label: '品牌', value: data.brand || '-' },
    { label: '剂量', value: data.dose || '-' },
    { label: '批次', value: data.batchNumber || '-' },
    { label: '接种日期', value: formatDate(data.vaccinationDate) },
    { label: '下次接种', value: formatDate(data.nextVaccinationDate) },
    { label: '医院', value: data.hospital || data.veterinarian || '-' },
    { label: '医生', value: data.doctor || '-' },
    { label: '备注', value: data.notes || '-' },
  ]

  return (
    <View className="page-container vaccine-detail-page">
      <View className="detail-hero">
        <View className="detail-icon">苗</View>
        <View className="detail-main">
          <Text className="detail-title">{data.vaccineName}</Text>
          <Text className="detail-subtitle">{data.pet?.name || '未关联宠物'}</Text>
          <View className="status-row">
            <Text className={`status-pill ${data.reminderEnabled ? 'active' : ''}`}>
              {data.reminderEnabled ? `提醒开启 · 提前 ${data.reminderDays || 30} 天` : '提醒关闭'}
            </Text>
            {data.nextVaccinationDate && <Text className="status-pill warn">下次 {formatDate(data.nextVaccinationDate)}</Text>}
          </View>
        </View>
      </View>

      <View className="detail-card">
        <Text className="card-title">接种信息</Text>
        {infoRows.map((item) => (
          <View className="info-row" key={item.label}>
            <Text className="info-label">{item.label}</Text>
            <Text className="info-value">{item.value}</Text>
          </View>
        ))}
      </View>

      <View className="detail-card timeline-card">
        <Text className="card-title">历史记录</Text>
        <View className="timeline-item">
          <Text className="timeline-dot" />
          <Text className="timeline-text">{formatDate(data.vaccinationDate)} 已接种</Text>
        </View>
        <View className="timeline-item muted">
          <Text className="timeline-dot" />
          <Text className="timeline-text">{data.nextVaccinationDate ? `${formatDate(data.nextVaccinationDate)} 待提醒` : '暂未设置下次提醒'}</Text>
        </View>
      </View>

      <View className="action-row">
        <Button className="action-btn primary" onClick={() => Taro.navigateTo({ url: `/pages/vaccines/add/index?id=${data.id}` })}>编辑</Button>
        <Button className="action-btn danger" onClick={handleDelete}>删除</Button>
      </View>
    </View>
  )
}

export default VaccineDetailPage
