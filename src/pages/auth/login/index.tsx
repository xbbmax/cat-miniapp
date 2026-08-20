import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { authApi } from '@/services/auth'
import { useAuthStore } from '@/store/auth'
import { useLoad } from '@/hooks'
import './index.scss'

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberEmail, setRememberEmail] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [wechatLoading, setWechatLoading] = useState(false)
  const { loading, error, run } = useLoad()
  const { setAuth } = useAuthStore()

  useEffect(() => {
    const rememberedEmail = Taro.getStorageSync('remember_email')
    if (typeof rememberedEmail === 'string' && rememberedEmail) setEmail(rememberedEmail)
  }, [])

  const navToAgreement = (type: 'terms' | 'privacy') => {
    Taro.navigateTo({ url: `/pages/agreement/${type}/index` })
  }

  const ensureAgreement = () => {
    if (agreedToTerms) return true
    Taro.showToast({ title: '请先阅读并同意用户协议和隐私政策', icon: 'none' })
    return false
  }

  const finishLogin = (token: string, user: Parameters<typeof setAuth>[1]) => {
    setAuth(token, user)
    if (rememberEmail && email.trim()) {
      Taro.setStorageSync('remember_email', email.trim())
    } else {
      Taro.removeStorageSync('remember_email')
    }
    Taro.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => Taro.switchTab({ url: '/pages/index/index' }), 500)
  }

  const handleEmailLogin = useCallback(async () => {
    if (!email.trim()) {
      Taro.showToast({ title: '请输入邮箱', icon: 'none' })
      return
    }
    if (!password) {
      Taro.showToast({ title: '请输入密码', icon: 'none' })
      return
    }
    if (!ensureAgreement()) return

    const res = await run(() => authApi.login({ email: email.trim(), password }))
    if (res) finishLogin(res.token, res.user)
  }, [email, password, rememberEmail, agreedToTerms, run])

  const handleWechatLogin = useCallback(async () => {
    if (!ensureAgreement()) return

    setWechatLoading(true)
    try {
      const loginRes = await Taro.login()
      if (!loginRes.code) {
        Taro.showToast({ title: '微信登录失败，请重试', icon: 'none' })
        return
      }
      const res = await authApi.wechatLogin({ code: loginRes.code })
      if (res.success && res.data) {
        finishLogin(res.data.token, res.data.user)
      } else {
        Taro.showToast({ title: res.error || '微信登录暂未开通', icon: 'none' })
      }
    } finally {
      setWechatLoading(false)
    }
  }, [agreedToTerms])

  return (
    <View className="auth-page login-page">
      <View className="auth-brand">
        <View className="brand-mark">P</View>
        <Text className="brand-name">Pawday</Text>
        <Text className="brand-desc">管理宠物健康与到期提醒</Text>
      </View>

      <View className="auth-card">
        <Text className="auth-title">登录账号</Text>
        <Text className="auth-subtitle">微信登录与网页邮箱账号将使用同一套数据。</Text>

        <Button className="wechat-login-btn" onClick={handleWechatLogin} loading={wechatLoading} disabled={wechatLoading}>
          微信一键登录
        </Button>

        <View className="login-divider"><Text>或使用邮箱登录</Text></View>

        <View className="form-group">
          <Text className="form-label">邮箱</Text>
          <Input className="form-input" type="text" placeholder="请输入邮箱地址" value={email} onInput={(event) => setEmail(event.detail.value)} maxlength={100} />
        </View>
        <View className="form-group">
          <Text className="form-label">密码</Text>
          <Input className="form-input" type="password" placeholder="请输入密码" value={password} onInput={(event) => setPassword(event.detail.value)} maxlength={50} />
        </View>

        <View className="form-options">
          <View className="remember-row" onClick={() => setRememberEmail((value) => !value)}>
            <View className={`checkbox ${rememberEmail ? 'checked' : ''}`} />
            <Text className="remember-text">记住邮箱</Text>
          </View>
          <Text className="forgot-link" onClick={() => Taro.navigateTo({ url: '/pages/auth/forgot-password/index' })}>忘记密码？</Text>
        </View>

        <Button className="login-btn" onClick={handleEmailLogin} disabled={loading} loading={loading}>邮箱登录</Button>
        {error && <Text className="error-msg">{error}</Text>}

        <View className="agreement-row" onClick={() => setAgreedToTerms((value) => !value)}>
          <View className={`checkbox ${agreedToTerms ? 'checked' : ''}`} />
          <Text className="agreement-text">
            已阅读并同意
            <Text className="agreement-link" catchClick onClick={(event) => { event.stopPropagation(); navToAgreement('terms') }}>《用户协议》</Text>
            和
            <Text className="agreement-link" catchClick onClick={(event) => { event.stopPropagation(); navToAgreement('privacy') }}>《隐私政策》</Text>
          </Text>
        </View>

        <View className="auth-footer">
          <Text className="footer-text">还没有账号？</Text>
          <Text className="footer-link" onClick={() => Taro.navigateTo({ url: '/pages/auth/register/index' })}>立即注册</Text>
        </View>
      </View>
    </View>
  )
}

export default LoginPage
