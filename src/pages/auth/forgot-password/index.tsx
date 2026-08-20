import React, { useCallback, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { authApi } from '@/services/auth'
import './index.scss'

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = useCallback(async () => {
    const normalizedEmail = email.trim()
    if (!normalizedEmail) {
      Taro.showToast({ title: '请输入邮箱', icon: 'none' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Taro.showToast({ title: '邮箱格式不正确', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await authApi.forgotPassword({ email: normalizedEmail })
      if (res.success) {
        setSent(true)
        Taro.showToast({ title: '重置邮件已发送', icon: 'success' })
      } else {
        Taro.showToast({ title: res.error || '发送失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [email])

  return (
    <View className="auth-page forgot-password-page">
      <View className="auth-brand">
        <View className="brand-mark">P</View>
        <Text className="brand-name">找回密码</Text>
        <Text className="brand-desc">通过注册邮箱重设网页端和小程序共用账号的密码。</Text>
      </View>

      <View className="auth-card">
        <Text className="auth-title">{sent ? '请查收邮件' : '发送重置链接'}</Text>
        <Text className="auth-subtitle">
          {sent
            ? '重置密码链接已发送到你的邮箱，请在邮件中继续操作。'
            : '输入注册邮箱后，我们会发送一封密码重置邮件。'}
        </Text>

        {!sent && (
          <View className="form-group">
            <Text className="form-label">注册邮箱</Text>
            <Input className="form-input" type="text" placeholder="请输入注册邮箱" value={email} onInput={(event) => setEmail(event.detail.value)} maxlength={100} />
          </View>
        )}

        <Button className={`submit-btn ${sent ? 'secondary' : ''}`} onClick={sent ? () => Taro.navigateBack() : handleSubmit} loading={loading} disabled={loading}>
          {sent ? '返回登录' : '发送重置邮件'}
        </Button>
      </View>
    </View>
  )
}

export default ForgotPasswordPage
