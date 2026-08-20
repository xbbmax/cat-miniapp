import React, { useEffect, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { authApi } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { useAuth } from '@/hooks'
import FormItem from '@/components/FormItem'
import './index.scss'

const ProfileEditPage: React.FC = () => {
  const { requireAuth } = useAuth()
  const { user, setUser } = useAuthStore()
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!requireAuth()) return
    setNickname(user?.nickname || '')
    setPhone(user?.phone || '')
  }, [requireAuth, user?.nickname, user?.phone])

  const handleAvatarPlaceholder = () => {
    Taro.showToast({ title: '头像上传功能后续开放', icon: 'none' })
  }

  const handleSave = async () => {
    if (submitting) return
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.updateProfile({
        nickname: nickname.trim(),
        phone: phone.trim() || undefined,
      })
      if (res.success && res.data) {
        setUser(res.data)
        Taro.showToast({ title: '保存成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 500)
      } else {
        Taro.showToast({ title: res.error || '保存失败', icon: 'none' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="page-container profile-edit-page">
      <View className="edit-hero">
        <Text className="hero-kicker">个人资料</Text>
        <Text className="hero-title">维护你的账号信息</Text>
        <Text className="hero-desc">昵称和手机号会用于账号识别与后续人工服务联系。</Text>
      </View>

      <View className="profile-card">
        <View className="avatar-row">
          <View className="avatar-preview">{nickname.trim().charAt(0) || 'P'}</View>
          <View className="avatar-copy">
            <Text className="avatar-title">账号头像</Text>
            <Text className="avatar-desc">已预留头像上传能力</Text>
          </View>
          <View className="avatar-action" onClick={handleAvatarPlaceholder}>预留</View>
        </View>
      </View>

      <View className="profile-card">
        <Text className="section-title">基础信息</Text>
        <FormItem label="昵称" required>
          <Input
            className="profile-input ui-input"
            value={nickname}
            placeholder="请输入昵称"
            onInput={(event) => setNickname(event.detail.value)}
            maxlength={30}
          />
        </FormItem>
        <FormItem label="邮箱">
          <View className="readonly-field">{user?.email || '-'}</View>
        </FormItem>
        <FormItem label="手机号">
          <Input
            className="profile-input ui-input"
            type="number"
            value={phone}
            placeholder="请输入手机号（选填）"
            onInput={(event) => setPhone(event.detail.value)}
            maxlength={20}
          />
        </FormItem>
      </View>

      <View className="profile-card">
        <Text className="section-title">账号绑定</Text>
        <View className="binding-row">
          <View>
            <Text className="binding-label">微信绑定</Text>
            <Text className="binding-desc">{user?.wechatNickname || '用于小程序登录和账号同步'}</Text>
          </View>
          <Text className={`binding-value ${user?.wechatBound ? 'bound' : ''}`}>
            {user?.wechatBound ? '已绑定' : '未绑定'}
          </Text>
        </View>
        <View className="binding-row">
          <View>
            <Text className="binding-label">手机号验证</Text>
            <Text className="binding-desc">用于后续账号安全与服务联系</Text>
          </View>
          <Text className={`binding-value ${user?.phoneBound ? 'bound' : ''}`}>
            {user?.phoneBound ? '已验证' : '未验证'}
          </Text>
        </View>
      </View>

      <Button className="profile-submit ui-primary-btn" onClick={handleSave} loading={submitting} disabled={submitting}>
        保存资料
      </Button>
    </View>
  )
}

export default ProfileEditPage
