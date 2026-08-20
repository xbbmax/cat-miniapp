import React, { useState } from 'react'
import { Button, Input, Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { authApi } from '@/services/auth'
import FormItem from '@/components/FormItem'
import './index.scss'

const PasswordPage: React.FC = () => {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (submitting) return
    if (!currentPwd) {
      Taro.showToast({ title: '请输入当前密码', icon: 'none' })
      return
    }
    if (!newPwd || newPwd.length < 6) {
      Taro.showToast({ title: '新密码至少 6 位', icon: 'none' })
      return
    }
    if (newPwd !== confirmPwd) {
      Taro.showToast({ title: '两次密码输入不一致', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const res = await authApi.changePassword({ currentPassword: currentPwd, newPassword: newPwd })
      if (res.success) {
        Taro.showToast({ title: '密码修改成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 700)
      } else {
        Taro.showToast({ title: res.error || '修改失败', icon: 'none' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="page-container password-page">
      <View className="password-hero">
        <Text className="hero-kicker">账号安全</Text>
        <Text className="hero-title">修改登录密码</Text>
        <Text className="hero-desc">建议设置不少于 6 位且不易被猜测的新密码。</Text>
      </View>
      <View className="password-card">
        <FormItem label="当前密码" required>
          <Input className="password-input ui-input" type="password" value={currentPwd} placeholder="输入当前密码" onInput={(event) => setCurrentPwd(event.detail.value)} maxlength={64} />
        </FormItem>
        <FormItem label="新密码" required>
          <Input className="password-input ui-input" type="password" value={newPwd} placeholder="至少 6 位" onInput={(event) => setNewPwd(event.detail.value)} maxlength={64} />
        </FormItem>
        <FormItem label="确认新密码" required>
          <Input className="password-input ui-input" type="password" value={confirmPwd} placeholder="再次输入新密码" onInput={(event) => setConfirmPwd(event.detail.value)} maxlength={64} />
        </FormItem>
      </View>
      <Button className="submit-btn ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
        修改密码
      </Button>
    </View>
  )
}

export default PasswordPage
