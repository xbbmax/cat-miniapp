import React from 'react'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/hooks'
import './index.scss'

const formatDate = (value?: string) => value ? value.slice(0, 10) : '未开通'

const MembershipPage: React.FC = () => {
  const { user } = useAuthStore()
  const { requireAuth } = useAuth()

  if (!requireAuth()) return null

  const isPaid = user?.membershipStatus === 'paid'
  const benefits = [
    { name: '宠物资料管理', free: '支持', paid: '支持' },
    { name: '产品效期管理', free: '支持', paid: '支持' },
    { name: '疫苗与用药提醒', free: '基础提醒', paid: '完整提醒' },
    { name: '健康计划与记录', free: '支持', paid: '支持' },
    { name: '人工协助开通', free: '可升级', paid: '可续费' },
  ]

  return (
    <View className="page-container membership-page">
      <View className={`membership-hero ${isPaid ? 'paid' : ''}`}>
        <View className="membership-top">
          <Text className="membership-kicker">{isPaid ? 'PAWDAY MEMBER' : 'PAWDAY FREE'}</Text>
          <Text className="membership-badge">{isPaid ? '付费会员' : '免费会员'}</Text>
        </View>
        <Text className="membership-title">{isPaid ? '会员权益已生效' : '当前为免费会员'}</Text>
        <Text className="membership-desc">
          {isPaid
            ? '已为你的宠物健康管理提供完整提醒支持。'
            : '可通过人工开通方式升级，后续会员档位可平滑扩展。'}
        </Text>
        <View className="membership-meta">
          <Text>{isPaid ? '到期时间' : '开通状态'}</Text>
          <Text className="membership-meta-value">{isPaid ? formatDate(user?.membershipExpiresAt) : '未开通'}</Text>
        </View>
      </View>

      <View className="membership-section">
        <View className="section-heading">
          <Text className="section-title">权益说明</Text>
          <Text className="section-note">免费 / 会员</Text>
        </View>
        <View className="benefit-list">
          {benefits.map((item) => (
            <View key={item.name} className="benefit-item">
              <Text className="benefit-name">{item.name}</Text>
              <View className="benefit-values">
                <Text className="benefit-free">{item.free}</Text>
                <Text className="benefit-paid">{item.paid}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className="membership-section membership-notice">
        <Text className="notice-title">当前开通方式</Text>
        <Text className="notice-desc">现阶段通过人工联系完成会员开通或续费，不展示线上支付和订单流程。</Text>
      </View>

      <View className="member-actions">
        <View className="action-btn secondary" onClick={() => Taro.navigateTo({ url: '/pages/settings/feedback/index' })}>
          联系我们
        </View>
        <View className="action-btn primary" onClick={() => Taro.navigateTo({ url: '/pages/membership/open/index' })}>
          {isPaid ? '会员续费' : '人工开通'}
        </View>
      </View>
    </View>
  )
}

export default MembershipPage
