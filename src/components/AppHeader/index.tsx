import React from 'react'
import { Image, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import notificationIcon from '@/assets/icons/notification.png'
import './index.scss'

const AppHeader: React.FC = () => {
  const { isInitialized, isLoggedIn, user } = useAuthStore()
  const { unreadCount } = useAppStore()
  const windowInfo = Taro.getWindowInfo()
  const menuButton = Taro.getMenuButtonBoundingClientRect()
  const statusBarHeight = windowInfo.statusBarHeight || 20
  const navigationHeight = menuButton?.height
    ? (menuButton.top - statusBarHeight) * 2 + menuButton.height
    : 44
  const capsuleReserve = menuButton?.left
    ? Math.max(windowInfo.windowWidth - menuButton.left + 8, 96)
    : 96
  const totalHeight = statusBarHeight + navigationHeight

  const openHome = () => {
    Taro.switchTab({ url: '/pages/index/index' })
  }

  const openPage = (url: string) => {
    Taro.navigateTo({ url })
  }

  return (
    <>
      <View className="app-header-spacer" style={{ height: `${totalHeight}px` }} />
      <View className="app-header">
        <View className="app-header-status" style={{ height: `${statusBarHeight}px` }} />
        <View
          className="app-header-main"
          style={{
            height: `${navigationHeight}px`,
            paddingRight: `${capsuleReserve}px`,
          }}
        >
          <View className="app-header-brand" onClick={openHome}>
            <View className="app-header-logo">宠</View>
            <Text className="app-header-name">宠爱有期</Text>
          </View>

          <View className="app-header-actions">
            {!isInitialized ? (
              <View className="app-header-placeholder" />
            ) : isLoggedIn ? (
              <>
                <View
                  className="app-header-notification"
                  onClick={() => openPage('/pages/notifications/index/index')}
                >
                  <Image
                    className="app-header-notification-icon"
                    src={notificationIcon}
                    mode="aspectFit"
                  />
                  {unreadCount > 0 && (
                    <Text className="app-header-badge">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  )}
                </View>
                <View
                  className="app-header-avatar"
                  onClick={() => openPage('/pages/profile/index/index')}
                >
                  {user?.nickname?.charAt(0) || '我'}
                </View>
              </>
            ) : (
              <>
                <Text
                  className="app-header-login"
                  onClick={() => openPage('/pages/auth/login/index')}
                >
                  登录
                </Text>
                <View
                  className="app-header-register"
                  onClick={() => openPage('/pages/auth/register/index')}
                >
                  注册
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </>
  )
}

export default AppHeader
