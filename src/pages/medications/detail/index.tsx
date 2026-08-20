import React, { useEffect, useState } from 'react'
import { Button, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { medicationsApi } from '@/services/health'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import type { Medication } from '@/types'
import './index.scss'

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

const MedicationDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id || ''
  const [data, setData] = useState<Medication | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    medicationsApi.getDetail(id).then((res) => {
      if (res.success && res.data) {
        setData(res.data)
      } else {
        Taro.showToast({ title: res.error || '用药记录加载失败', icon: 'none' })
      }
      setLoading(false)
    })
  }, [id])

  const handleDelete = () => {
    Taro.showModal({
      title: '删除用药记录',
      content: `确定删除“${data?.medicationName || '当前记录'}”吗？`,
      confirmColor: '#D84A4A',
      success: async (res) => {
        if (!res.confirm) return
        const del = await medicationsApi.delete(id)
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
        <EmptyState title="记录不存在" description="该用药记录可能已删除或暂时无访问权限。" />
      </View>
    )
  }

  const typeLabel = TYPE_LABEL[data.type] || '其他'
  const frequencyLabel = FREQUENCY_LABEL[data.frequency || ''] || data.frequency || '-'
  const frequencyText = data.frequency === 'custom' && data.frequencyDays
    ? `${frequencyLabel}，每 ${data.frequencyDays} 天`
    : frequencyLabel
  const infoRows = [
    { label: '宠物', value: data.pet?.name || '-' },
    { label: '类型', value: typeLabel },
    { label: '用途', value: data.purpose || '-' },
    { label: '剂量', value: data.dosage || '-' },
    { label: '频率', value: frequencyText },
    { label: '开始时间', value: formatDate(data.startDate || data.lastDoseDate) },
    { label: '结束时间', value: formatDate(data.endDate) },
    { label: '上次用药', value: formatDate(data.lastDoseDate) },
    { label: '下次用药', value: formatDate(data.nextDoseDate) },
    { label: '备注', value: data.notes || '-' },
  ]

  return (
    <View className="page-container medication-detail-page">
      <View className="detail-hero">
        <View className={`detail-icon detail-icon-${data.type}`}>药</View>
        <View className="detail-main">
          <Text className="detail-title">{data.medicationName}</Text>
          <Text className="detail-subtitle">{data.pet?.name || '未关联宠物'} · {typeLabel}</Text>
          <View className="status-row">
            <Text className={`status-pill ${data.reminderEnabled ? 'active' : ''}`}>
              {data.reminderEnabled ? `提醒开启 · 提前 ${data.reminderDays || 7} 天` : '提醒关闭'}
            </Text>
            {data.nextDoseDate && <Text className="status-pill warn">下次 {formatDate(data.nextDoseDate)}</Text>}
          </View>
        </View>
      </View>

      <View className="detail-card">
        <Text className="card-title">用药信息</Text>
        {infoRows.map((item) => (
          <View className="info-row" key={item.label}>
            <Text className="info-label">{item.label}</Text>
            <Text className="info-value">{item.value}</Text>
          </View>
        ))}
      </View>

      <View className="detail-card timeline-card">
        <Text className="card-title">执行记录</Text>
        <View className="timeline-item">
          <Text className="timeline-dot" />
          <Text className="timeline-text">{formatDate(data.lastDoseDate)} 已记录用药</Text>
        </View>
        <View className="timeline-item muted">
          <Text className="timeline-dot" />
          <Text className="timeline-text">
            {data.nextDoseDate ? `${formatDate(data.nextDoseDate)} 待提醒` : '暂未设置下一次用药'}
          </Text>
        </View>
      </View>

      <View className="action-row">
        <Button className="action-btn primary" onClick={() => Taro.navigateTo({ url: `/pages/medications/add/index?id=${data.id}` })}>
          编辑
        </Button>
        <Button className="action-btn danger" onClick={handleDelete}>删除</Button>
      </View>
    </View>
  )
}

export default MedicationDetailPage
