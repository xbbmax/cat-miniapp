import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { productsApi } from '@/services/products'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import ProductVisual from '@/components/ProductVisual'
import type { Product } from '@/types'
import './index.scss'

const getExpiryStatus = (product: Product) => {
  if (product.status === 'depleted') return { label: '已用完', color: '#8C9B96', bg: '#F0F3F2' }
  if (product.status === 'expired' || (product.remainingDays !== undefined && product.remainingDays <= 0)) {
    return { label: '已过期', color: '#D84A4A', bg: '#FFF0F0' }
  }
  if (product.remainingDays !== undefined && product.remainingDays <= 30) {
    return { label: '临期', color: '#D98A18', bg: '#FFF6E7' }
  }
  return { label: '正常', color: '#2E9D64', bg: '#EAF7EF' }
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id || ''
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getDetail(id).then((res) => {
      if (res.success && res.data) setProduct(res.data)
      setLoading(false)
    })
  }, [id])

  const statusInfo = useMemo(() => product ? getExpiryStatus(product) : null, [product])

  const handleOpenProduct = async () => {
    if (!product) return
    const now = new Date().toISOString()
    const res = await productsApi.update(id, { isOpened: true, openedAt: now })
    if (res.success) {
      setProduct((prev) => prev ? { ...prev, isOpened: true, openedAt: now } : prev)
      Taro.showToast({ title: '已标记为开封', icon: 'success' })
    } else {
      Taro.showToast({ title: res.error || '操作失败', icon: 'none' })
    }
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '删除产品',
      content: `确定要删除「${product?.name}」吗？删除后不可恢复。`,
      confirmColor: '#D84A4A',
      success: async (res) => {
        if (res.confirm) {
          const del = await productsApi.delete(id)
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

  if (!product || !statusInfo) {
    return (
      <View className="page-container">
        <EmptyState title="产品信息不存在" description="该产品可能已删除或暂无访问权限。" />
      </View>
    )
  }

  const reminderText = product.reminderEnabled === false
    ? '提醒关闭'
    : `到期前 ${product.reminderDays || 30} 天提醒`

  const remainingText = product.remainingDays !== undefined
    ? product.remainingDays > 0 ? `剩余 ${product.remainingDays} 天` : '已过期'
    : '-'

  const infoRows = [
    { label: '分类', value: product.category?.name || '-' },
    { label: '自定义分类', value: product.customCategoryName || '-' },
    { label: '批次号', value: product.batchNumber || '-' },
    { label: '规格', value: product.specification || '-' },
    { label: '生产日期', value: product.startDate?.slice(0, 10) || '-' },
    { label: '过期日期', value: product.endDate?.slice(0, 10) || '-' },
    { label: '开封日期', value: product.openedAt?.slice(0, 10) || '未开封' },
    { label: '数量', value: product.quantity ?? '-' },
    { label: '提醒', value: reminderText },
    { label: '关联宠物', value: product.pets?.map((pet) => pet.name).join('、') || '-' },
    { label: '备注', value: product.notes || '-' },
  ]

  return (
    <View className="page-container product-detail-page">
      <View className="detail-header">
        <ProductVisual category={product.category} size="lg" className="detail-visual" />
        <View className="detail-summary">
          <View className="detail-name-row">
            <Text className="detail-name">{product.name}</Text>
            <Text className="status-chip" style={{ color: statusInfo.color, background: statusInfo.bg }}>
              {statusInfo.label}
            </Text>
          </View>
          <Text className="detail-subtitle">{product.category?.name || product.customCategoryName || '未设置分类'}</Text>
          <View className="detail-metrics">
            <View className="metric-item">
              <Text className="metric-value" style={{ color: statusInfo.color }}>{remainingText}</Text>
              <Text className="metric-label">效期状态</Text>
            </View>
            <View className="metric-item">
              <Text className="metric-value">{product.isOpened ? '已开封' : '未开封'}</Text>
              <Text className="metric-label">开封状态</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="info-section">
        <Text className="card-title">产品信息</Text>
        {infoRows.map((item) => (
          <View className="info-item" key={item.label}>
            <Text className="info-label">{item.label}</Text>
            <Text className="info-value">{item.value}</Text>
          </View>
        ))}
      </View>

      <View className="timeline-section">
        <Text className="card-title">提醒时间线</Text>
        <View className="timeline-item">
          <Text className="timeline-dot" />
          <Text className="timeline-text">生产 / 生效：{product.startDate?.slice(0, 10) || '-'}</Text>
        </View>
        <View className="timeline-item">
          <Text className="timeline-dot" />
          <Text className="timeline-text">过期日期：{product.endDate?.slice(0, 10) || '-'}</Text>
        </View>
        <View className="timeline-item muted">
          <Text className="timeline-dot" />
          <Text className="timeline-text">{product.openedAt ? `开封日期：${product.openedAt.slice(0, 10)}` : '尚未开封，可在详情页标记。'}</Text>
        </View>
      </View>

      <View className="action-row">
        <Button className="action-btn primary" onClick={() => Taro.navigateTo({ url: `/pages/products/add/index?id=${product.id}` })}>
          编辑产品
        </Button>
        {!product.isOpened && <Button className="action-btn warn" onClick={handleOpenProduct}>标记开封</Button>}
        <Button className="action-btn danger" onClick={handleDelete}>删除产品</Button>
      </View>
    </View>
  )
}

export default ProductDetailPage
