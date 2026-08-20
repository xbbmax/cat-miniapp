import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/hooks'
import { useFeatureGate } from '@/hooks/useFeatureGate'
import './index.scss'

const ProfilePage: React.FC = () => {
  const { isLoggedIn, user, logout } = useAuthStore()
  const { requireAuth } = useAuth()
  const { isEnabled, canOpenUrl } = useFeatureGate()

  const menuGroups = [
    {
      title: '会员',
      items: [
        { icon: '会', label: '会员中心', desc: '查看权益与开通方式', url: '/pages/membership/index', featureKey: 'profileMembership' },
        { icon: '码', label: '人工开通', desc: '二维码联系开通会员', url: '/pages/membership/open/index', featureKey: 'profileManualMembership' },
      ],
    },
    {
      title: '管理',
      items: [
        { icon: '苗', label: '疫苗记录', desc: '接种记录和下次提醒', url: '/pages/vaccines/index/index', featureKey: 'vaccine' },
        { icon: '药', label: '用药记录', desc: '驱虫、治疗和日常用药', url: '/pages/medications/index/index', featureKey: 'medication' },
        { icon: '计', label: '健康计划', desc: '周期性健康事项', url: '/pages/plans/index/index' },
        { icon: '记', label: '健康记录', desc: '体重、检查和护理记录', url: '/pages/records/index/index' },
      ],
    },
    {
      title: '设置',
      items: [
        { icon: '人', label: '个人资料', desc: '昵称、邮箱、手机号和绑定状态', url: '/pages/profile/edit/index', featureKey: 'profileEdit' },
        { icon: '醒', label: '提醒设置', desc: '通知偏好和功能开关', url: '/pages/settings/index/index', featureKey: 'profileReminderSettings' },
        { icon: '密', label: '修改密码', desc: '更新当前账号密码', url: '/pages/settings/password/index', featureKey: 'profilePassword' },
      ],
    },
    {
      title: '其他',
      items: [
        { icon: '馈', label: '意见反馈', desc: '提交问题和建议', url: '/pages/settings/feedback/index', featureKey: 'profileFeedback' },
        { icon: '议', label: '用户协议', desc: '查看服务使用规则', url: '/pages/agreement/terms/index' },
        { icon: '私', label: '隐私政策', desc: '查看信息收集与使用说明', url: '/pages/agreement/privacy/index' },
      ],
    },
  ]

  const tabPages = new Set([
    '/pages/pets/index/index',
    '/pages/vaccines/index/index',
    '/pages/medications/index/index',
    '/pages/products/index/index',
  ])

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出当前账号吗？',
      success: (res) => {
        if (res.confirm) {
          logout()
          Taro.switchTab({ url: '/pages/index/index' })
        }
      },
    })
  }

  const membershipText = user?.membershipStatus === 'paid' ? '付费会员' : '免费会员'
  const wechatText = user?.wechatBound ? '微信已绑定' : '微信未绑定'
  const phoneText = user?.phoneBound ? '手机号已验证' : '手机号未验证'

  if (!isLoggedIn) {
    return (
      <View className="page-container">
        <View className="profile-not-login">
          <View className="profile-avatar-empty">P</View>
          <Text className="profile-name-empty">暂未登录</Text>
          <Text className="profile-desc-empty">登录后可同步宠物档案、提醒和会员状态。</Text>
          <View className="profile-login-btn" onClick={() => Taro.navigateTo({ url: '/pages/auth/login/index' })}>
            登录 / 注册
          </View>
        </View>
      </View>
    )
  }

  return (
    <View className="page-container profile-page">
      <View className="profile-card">
        <View className="profile-avatar">{user?.nickname?.charAt(0) || 'P'}</View>
        <View className="profile-user-info">
          <Text className="profile-nickname">{user?.nickname || '未设置昵称'}</Text>
          <Text className="profile-email">{user?.email || '邮箱未绑定'}</Text>
          <View className="profile-tags">
            <Text className="profile-tag member">{membershipText}</Text>
            <Text className="profile-tag">{wechatText}</Text>
            <Text className="profile-tag">{phoneText}</Text>
          </View>
        </View>
        {isEnabled('profileEdit') && (
          <View className="profile-edit" onClick={() => Taro.navigateTo({ url: '/pages/profile/edit/index' })}>
            编辑
          </View>
        )}
      </View>

      <View className="quick-grid">
        {isEnabled('pet') && (
          <View className="quick-item" onClick={() => canOpenUrl('/pages/pets/index/index') && Taro.switchTab({ url: '/pages/pets/index/index' })}>
            <Text className="quick-icon">宠</Text>
            <Text className="quick-label">我的宠物</Text>
          </View>
        )}
        {isEnabled('product') && (
          <View className="quick-item" onClick={() => canOpenUrl('/pages/products/index/index') && Taro.switchTab({ url: '/pages/products/index/index' })}>
            <Text className="quick-icon">品</Text>
            <Text className="quick-label">产品库存</Text>
          </View>
        )}
        <View className="quick-item" onClick={() => Taro.navigateTo({ url: '/pages/notifications/index/index' })}>
          <Text className="quick-icon">知</Text>
          <Text className="quick-label">通知中心</Text>
        </View>
      </View>

      {menuGroups.map((group) => (
        <View key={group.title} className="menu-group">
          <Text className="menu-group-title">{group.title}</Text>
          {group.items.filter((item) => !item.featureKey || isEnabled(item.featureKey as any)).map((item) => (
            <View
              key={item.label}
              className="menu-item"
              onClick={() => {
                if (item.url && requireAuth()) {
                  if (!canOpenUrl(item.url)) return
                  if (tabPages.has(item.url)) {
                    Taro.switchTab({ url: item.url })
                  } else {
                    Taro.navigateTo({ url: item.url })
                  }
                }
              }}
            >
              <View className="menu-item-left">
                <Text className="menu-item-icon">{item.icon}</Text>
                <View className="menu-item-copy">
                  <Text className="menu-item-label">{item.label}</Text>
                  <Text className="menu-item-desc">{item.desc}</Text>
                </View>
              </View>
              <Text className="menu-item-arrow">›</Text>
            </View>
          ))}
        </View>
      ))}

      <View className="logout-btn" onClick={handleLogout}>退出登录</View>
    </View>
  )
}

export default ProfilePage
