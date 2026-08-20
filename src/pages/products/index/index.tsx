import React, { useCallback, useMemo, useState } from 'react'
import { Input, View, Text } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { productsApi } from '@/services/products'
import { useAuth } from '@/hooks'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import Loading from '@/components/Loading'
import EmptyState from '@/components/EmptyState'
import ProductVisual from '@/components/ProductVisual'
import AppHeader from '@/components/AppHeader'
import type { Product } from '@/types'
import './index.scss'

type ProductFilter = 'all' | 'active' | 'expiring' | 'expired'

const STATUS_CONFIG = {
  active: { label: '正常', color: '#2E9D64', bg: '#EAF7EF' },
  expiring: { label: '临期', color: '#D98A18', bg: '#FFF6E7' },
  expired: { label: '过期', color: '#D84A4A', bg: '#FFF0F0' },
  depleted: { label: '已用完', color: '#8C9B96', bg: '#F0F3F2' },
} as const

const getStatusInfo = (product: Product) => {
  if (product.status !== 'active') return STATUS_CONFIG[product.status] || STATUS_CONFIG.active
  if (product.remainingDays !== undefined && product.remainingDays <= 30) return STATUS_CONFIG.expiring
  return STATUS_CONFIG.active
}

const ProductListPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const { guardFeature } = useFeatureGate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ProductFilter>('all')
  const [search, setSearch] = useState('')

  const fetchProducts = useCallback(async () => {
    if (!(await guardFeature('product'))) {
      setLoading(false)
      return
    }
    if (!requireAuth()) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const params: Record<string, string> = {}
      if (filter !== 'all') params.status = filter
      if (search.trim()) params.search = search.trim()
      const res = await productsApi.getList(params)
      if (res.success && res.data) setProducts(res.data)
    } catch {
      // Keep current list when a refresh fails.
    } finally {
      setLoading(false)
    }
  }, [filter, search, requireAuth, guardFeature])

  useDidShow(() => { fetchProducts() })

  const filters: Array<{ key: ProductFilter; label: string }> = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '正常' },
    { key: 'expiring', label: '临期' },
    { key: 'expired', label: '过期' },
  ]

  const stats = useMemo(() => {
    const expiring = products.filter((product) => getStatusInfo(product).label === '临期').length
    const expired = products.filter((product) => getStatusInfo(product).label === '过期').length
    const opened = products.filter((product) => product.isOpened).length
    return { total: products.length, expiring, expired, opened }
  }, [products])

  if (loading) {
    return (
      <View className="page-container">
        <AppHeader />
        <Loading fullPage />
      </View>
    )
  }

  return (
    <View className="page-container products-page">
      <AppHeader />
      <View className="products-hero">
        <View>
          <Text className="hero-kicker">产品效期</Text>
          <Text className="hero-title">管理库存和到期提醒</Text>
        </View>
        <View className="hero-action" onClick={() => Taro.navigateTo({ url: '/pages/products/add/index' })}>添加</View>
      </View>

      <View className="stats-strip">
        <View className="stat-pill">
          <Text className="stat-value">{stats.total}</Text>
          <Text className="stat-label">库存</Text>
        </View>
        <View className="stat-pill">
          <Text className="stat-value">{stats.expiring}</Text>
          <Text className="stat-label">临期</Text>
        </View>
        <View className="stat-pill">
          <Text className="stat-value">{stats.opened}</Text>
          <Text className="stat-label">已开封</Text>
        </View>
        <View className="stat-pill danger">
          <Text className="stat-value">{stats.expired}</Text>
          <Text className="stat-label">过期</Text>
        </View>
      </View>

      <View className="search-bar">
        <Text className="search-icon">⌕</Text>
        <Input
          className="search-input"
          value={search}
          placeholder="搜索产品、分类或批次"
          confirmType="search"
          onInput={(event) => setSearch(event.detail.value)}
          onConfirm={fetchProducts}
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

      {products.length === 0 ? (
        <EmptyState
          icon="品"
          title="暂无库存产品"
          description="添加宠物食品、药品、保健品或用品后，可按效期和开封状态管理。"
          actionText="添加库存"
          onAction={() => Taro.navigateTo({ url: '/pages/products/add/index' })}
        />
      ) : (
        <View className="product-list">
          {products.map((product) => {
            const statusInfo = getStatusInfo(product)
            return (
              <View
                key={product.id}
                className="product-card"
                onClick={() => Taro.navigateTo({ url: `/pages/products/detail/index?id=${product.id}` })}
              >
                <ProductVisual
                  category={product.category}
                  title={product.name}
                  subtitle={product.category?.name || product.customCategoryName || '未设置分类'}
                  size="sm"
                />

                <View className="product-card-content">
                  <View className="product-header">
                    <Text className="product-name">{product.name}</Text>
                    <Text className="product-status" style={{ color: statusInfo.color, background: statusInfo.bg }}>
                      {statusInfo.label}
                    </Text>
                  </View>

                  <View className="product-meta-line">
                    <Text>{product.category?.name || product.customCategoryName || '未设置分类'}</Text>
                    <Text>{product.specification || '规格未填'}</Text>
                  </View>

                  <View className="product-meta-line">
                    <Text>{product.batchNumber ? `批次 ${product.batchNumber}` : '批次未填'}</Text>
                    <Text>{product.reminderEnabled === false ? '提醒关闭' : `提前 ${product.reminderDays || 30} 天提醒`}</Text>
                  </View>

                  <View className="product-footer">
                    <View className="product-pets">
                      {product.pets?.length ? product.pets.slice(0, 3).map((pet) => (
                        <Text key={pet.id} className="product-pet-tag">{pet.name}</Text>
                      )) : <Text className="product-pet-empty">未关联宠物</Text>}
                    </View>
                    <Text className="product-days" style={{ color: statusInfo.color }}>
                      {product.remainingDays !== undefined
                        ? product.remainingDays > 0 ? `剩余 ${product.remainingDays} 天` : '已过期'
                        : '-'}
                    </Text>
                  </View>

                  {product.isOpened && <Text className="product-opened">已开封</Text>}
                </View>
              </View>
            )
          })}
        </View>
      )}

      <View className="fab" onClick={() => Taro.navigateTo({ url: '/pages/products/add/index' })}>
        <Text className="fab-text">+</Text>
      </View>
    </View>
  )
}

export default ProductListPage
