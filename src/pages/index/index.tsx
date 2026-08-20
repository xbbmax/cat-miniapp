import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import AppHeader from '@/components/AppHeader'
import featurePetIcon from '@/assets/icons/feature-pet.png'
import featureVaccineIcon from '@/assets/icons/feature-vaccine.png'
import featureMedicationIcon from '@/assets/icons/feature-medication.png'
import featureProductIcon from '@/assets/icons/feature-product.png'
import './index.scss'

interface FeatureItem {
  icon: string
  title: string
  description: string
  url: string
  tab?: boolean
  featureKey: 'pet' | 'vaccine' | 'medication' | 'product'
  tone: 'blue' | 'green' | 'purple' | 'orange'
}

const features: FeatureItem[] = [
  {
    icon: featurePetIcon,
    title: '宠物管理',
    description: '记录基础信息和健康档案',
    url: '/pages/pets/index/index',
    tab: true,
    featureKey: 'pet',
    tone: 'blue',
  },
  {
    icon: featureVaccineIcon,
    title: '疫苗管理',
    description: '接种记录到期提醒',
    url: '/pages/vaccines/index/index',
    tab: true,
    featureKey: 'vaccine',
    tone: 'green',
  },
  {
    icon: featureMedicationIcon,
    title: '用药管理',
    description: '用药记录周期跟踪',
    url: '/pages/medications/index/index',
    tab: true,
    featureKey: 'medication',
    tone: 'purple',
  },
  {
    icon: featureProductIcon,
    title: '库存管理',
    description: '商品效期过期提醒',
    url: '/pages/products/index/index',
    tab: true,
    featureKey: 'product',
    tone: 'orange',
  },
]

const highlights = [
  {
    icon: '心',
    title: '宠物健康一站式管理',
    description: '集中管理疫苗、用药、商品效期，告别散乱记录',
  },
  {
    icon: '护',
    title: '智能提醒零遗漏',
    description: '提前 N 天自动提醒，不再错过任何重要事项',
  },
  {
    icon: '时',
    title: '可视化时间轴',
    description: '健康记录一目了然，随时回顾历史档案',
  },
  {
    icon: '知',
    title: '站内信通知',
    description: '重要提醒直达通知，不遗漏任何到期事项',
  },
]

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore()
  const { isEnabled, canOpenUrl } = useFeatureGate()
  const visibleFeatures = features.filter((item) => isEnabled(item.featureKey))

  const goTo = (url: string, tab = false) => {
    if (tab) {
      Taro.switchTab({ url })
      return
    }
    Taro.navigateTo({ url })
  }

  const openFeature = (item: FeatureItem) => {
    if (!canOpenUrl(item.url)) return
    if (!isLoggedIn) {
      goTo('/pages/auth/register/index')
      return
    }
    goTo(item.url, item.tab)
  }

  const openPrimaryAction = () => {
    if (isLoggedIn) {
      goTo('/pages/profile/index/index')
      return
    }
    goTo('/pages/auth/register/index')
  }

  return (
    <View className="home-page">
      <AppHeader />

      <View className="hero-section">
        <Text className="hero-title">守护毛孩子的每一天</Text>
        <Text className="hero-description">疫苗 · 用药 · 效期 一站管理</Text>
        <View className="hero-button" onClick={openPrimaryAction}>
          {isLoggedIn ? '进入管理' : '立即开始'}
        </View>
      </View>

      <View className="features-section">
        <View className="feature-grid">
          {visibleFeatures.map((item) => (
            <View
              key={item.title}
              className="feature-card"
              onClick={() => openFeature(item)}
            >
              <View className={`feature-icon feature-icon-${item.tone}`}>
                <Image className="feature-icon-image" src={item.icon} mode="aspectFit" />
              </View>
              <Text className="feature-title">{item.title}</Text>
              <Text className="feature-description">{item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className="highlights-section">
        <Text className="highlights-title">功能亮点</Text>
        <View className="highlight-list">
          {highlights.map((item) => (
            <View key={item.title} className="highlight-item">
              <View className="highlight-icon">{item.icon}</View>
              <View className="highlight-content">
                <Text className="highlight-title">{item.title}</Text>
                <Text className="highlight-description">{item.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  )
}

export default HomePage
