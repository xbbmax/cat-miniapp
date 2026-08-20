import React, { useCallback, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { authApi } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { useLoad } from '@/hooks'
import './index.scss'

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const { loading, error, run } = useLoad()
  const { setAuth } = useAuthStore()

  const handleRegister = useCallback(async () => {
    const normalizedEmail = email.trim()
    const normalizedNickname = nickname.trim()

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      Taro.showToast({ title: '请输入有效的邮箱', icon: 'none' })
      return
    }
    if (!normalizedNickname) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (password.length < 6) {
      Taro.showToast({ title: '密码至少 6 位', icon: 'none' })
      return
    }
    if (password !== confirmPassword) {
      Taro.showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }
    if (!agreedToTerms) {
      Taro.showToast({ title: '请先同意用户协议和隐私政策', icon: 'none' })
      return
    }

    const result = await run(() => authApi.register({
      email: normalizedEmail,
      nickname: normalizedNickname,
      password,
    }))

    if (result) {
      setAuth(result.token, result.user)
      Taro.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 500)
    }
  }, [agreedToTerms, confirmPassword, email, nickname, password, run, setAuth])

  const navToAgreement = (type: 'terms' | 'privacy') => {
    Taro.navigateTo({ url: `/pages/agreement/${type}/index` })
  }

  return (
    <View className="auth-page register-page">
      <View className="auth-brand">
        <View className="brand-mark">P</View>
        <Text className="brand-name">创建 Pawday 账号</Text>
        <Text className="brand-desc">网页端与小程序共用同一套宠物健康数据</Text>
      </View>

      <View className="auth-card">
        <Text className="auth-title">注册账号</Text>
        <Text className="auth-subtitle">注册后可同步管理宠物、疫苗、用药和提醒</Text>

        <View className="form-group">
          <Text className="form-label">邮箱</Text>
          <Input
            className="form-input"
            type="text"
            placeholder="请输入邮箱地址"
            value={email}
            onInput={(event) => setEmail(event.detail.value)}
            maxlength={100}
          />
        </View>

        <View className="form-group">
          <Text className="form-label">昵称</Text>
          <Input
            className="form-input"
            type="text"
            placeholder="请输入昵称"
            value={nickname}
            onInput={(event) => setNickname(event.detail.value)}
            maxlength={30}
          />
        </View>

        <View className="form-group">
          <Text className="form-label">密码</Text>
          <Input
            className="form-input"
            type="password"
            placeholder="至少 6 位密码"
            value={password}
            onInput={(event) => setPassword(event.detail.value)}
            maxlength={100}
          />
        </View>

        <View className="form-group">
          <Text className="form-label">确认密码</Text>
          <Input
            className="form-input"
            type="password"
            placeholder="再次输入密码"
            value={confirmPassword}
            onInput={(event) => setConfirmPassword(event.detail.value)}
            maxlength={100}
          />
        </View>

        <View className="agreement-row" onClick={() => setAgreedToTerms((value) => !value)}>
          <View className={`checkbox ${agreedToTerms ? 'checked' : ''}`} />
          <Text className="agreement-text">
            我已阅读并同意
            <Text
              className="agreement-link"
              catchClick
              onClick={(event) => {
                event.stopPropagation()
                navToAgreement('terms')
              }}
            >
              《用户协议》
            </Text>
            和
            <Text
              className="agreement-link"
              catchClick
              onClick={(event) => {
                event.stopPropagation()
                navToAgreement('privacy')
              }}
            >
              《隐私政策》
            </Text>
          </Text>
        </View>

        <Button className="submit-btn" onClick={handleRegister} disabled={loading} loading={loading}>
          注册账号
        </Button>
        {error && <Text className="error-msg">{error}</Text>}

        <View className="auth-footer">
          <Text className="footer-text">已有账号？</Text>
          <Text className="footer-link" onClick={() => Taro.navigateBack()}>
            返回登录
          </Text>
        </View>
      </View>
    </View>
  )
}

export default RegisterPage
