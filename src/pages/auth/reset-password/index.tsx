import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { authApi } from '@/services/auth'
import './index.scss'

const ResetPasswordPage: React.FC = () => {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const value = router.params?.token
    if (value) {
      setToken(decodeURIComponent(value))
    } else {
      Taro.showToast({ title: '无效的重置链接', icon: 'none' })
    }
  }, [router.params?.token])

  const handleReset = useCallback(async () => {
    if (!token) return
    if (!password || password.length < 6) {
      Taro.showToast({ title: '密码至少 6 位', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }

    setLoading(true)
    try {
      const res = await authApi.resetPassword({ token, password })
      if (res.success) {
        Taro.showToast({ title: '密码重置成功', icon: 'success' })
        setTimeout(() => Taro.redirectTo({ url: '/pages/auth/login/index' }), 700)
      } else {
        Taro.showToast({ title: res.error || '重置失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [token, password, confirmPassword])

  const isInvalid = !token

  return (
    <View className="auth-page reset-password-page">
      <View className="auth-brand">
        <View className="brand-mark">P</View>
        <Text className="brand-name">{isInvalid ? '链接无效' : '设置新密码'}</Text>
        <Text className="brand-desc">
          {isInvalid ? '该重置链接无效或已过期，请重新发起找回密码。' : '设置完成后可使用新密码登录网页端和小程序。'}
        </Text>
      </View>

      <View className="auth-card">
        {isInvalid ? (
          <Button className="submit-btn secondary" onClick={() => Taro.navigateBack()}>返回</Button>
        ) : (
          <>
            <Text className="auth-title">重置密码</Text>
            <Text className="auth-subtitle">新密码至少 6 位，请妥善保管。</Text>
            <View className="form-group">
              <Text className="form-label">新密码</Text>
              <Input className="form-input" type="password" placeholder="至少 6 位" value={password} onInput={(event) => setPassword(event.detail.value)} maxlength={50} />
            </View>
            <View className="form-group">
              <Text className="form-label">确认密码</Text>
              <Input className="form-input" type="password" placeholder="再次输入新密码" value={confirmPassword} onInput={(event) => setConfirmPassword(event.detail.value)} maxlength={50} />
            </View>
            <Button className="submit-btn" onClick={handleReset} loading={loading} disabled={loading}>确认重置</Button>
          </>
        )}
      </View>
    </View>
  )
}

export default ResetPasswordPage
