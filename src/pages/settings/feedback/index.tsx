import React, { useState } from 'react'
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { api } from '@/services/api'
import FormItem from '@/components/FormItem'
import './index.scss'

const FEEDBACK_TYPES = [
  { value: 'bug', label: '问题反馈' },
  { value: 'suggestion', label: '功能建议' },
  { value: 'membership', label: '会员开通' },
  { value: 'other', label: '其他' },
]

const FeedbackPage: React.FC = () => {
  const [typeIdx, setTypeIdx] = useState(0)
  const [content, setContent] = useState('')
  const [contact, setContact] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (submitting) return
    if (!content.trim()) {
      Taro.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const selectedType = FEEDBACK_TYPES[typeIdx]
      const res = await api.post('/feedback', {
        type: selectedType.value,
        typeLabel: selectedType.label,
        content: content.trim(),
        contact: contact.trim() || undefined,
      })
      if (res.success) {
        Taro.showToast({ title: '反馈已提交', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 700)
      } else {
        Taro.showToast({ title: res.error || '提交失败', icon: 'none' })
      }
    } catch {
      Taro.showToast({ title: '提交失败', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="page-container feedback-page">
      <View className="feedback-hero">
        <Text className="hero-kicker">意见反馈</Text>
        <Text className="hero-title">告诉我们你的想法</Text>
        <Text className="hero-desc">问题、建议或会员开通需求都会由后台统一接收处理。</Text>
      </View>

      <View className="feedback-card">
        <FormItem label="反馈类型">
          <Picker mode="selector" range={FEEDBACK_TYPES} rangeKey="label" value={typeIdx} onChange={(event) => setTypeIdx(Number(event.detail.value))}>
            <View className="feedback-picker ui-picker">{FEEDBACK_TYPES[typeIdx]?.label}</View>
          </Picker>
        </FormItem>
        <FormItem label="反馈内容" required>
          <Textarea className="feedback-textarea ui-textarea" value={content} placeholder="请描述你遇到的问题或希望增加的功能" onInput={(event) => setContent(event.detail.value)} maxlength={1000} autoHeight />
        </FormItem>
        <FormItem label="联系方式">
          <Input className="feedback-input ui-input" value={contact} placeholder="微信或邮箱，方便我们联系（选填）" onInput={(event) => setContact(event.detail.value)} maxlength={100} />
        </FormItem>
      </View>

      <Button className="submit-btn ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
        提交反馈
      </Button>
    </View>
  )
}

export default FeedbackPage
