import React from 'react'
import { Text, View } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const MembershipOpenPage: React.FC = () => {
  return (
    <View className="page-container membership-open-page">
      <View className="open-hero">
        <Text className="open-kicker">人工服务</Text>
        <Text className="open-title">会员开通与续费</Text>
        <Text className="open-desc">当前通过人工方式处理会员开通、续费和权益核验，后续可接入新的支付方式。</Text>
      </View>

      <View className="qr-card">
        <View className="qr-box">
          <Text className="qr-mark">二维码</Text>
          <Text className="qr-note">客服二维码图片待替换</Text>
        </View>
        <Text className="qr-title">添加客服微信</Text>
        <Text className="qr-desc">添加后请备注“Pawday 会员开通”，并说明使用的账号信息。</Text>
      </View>

      <View className="steps-card">
        <Text className="card-title">开通步骤</Text>
        <View className="step-item"><Text className="step-index">1</Text><Text className="step-text">添加客服并备注会员开通需求。</Text></View>
        <View className="step-item"><Text className="step-index">2</Text><Text className="step-text">确认会员金额和服务期限后完成付款。</Text></View>
        <View className="step-item"><Text className="step-index">3</Text><Text className="step-text">人工核验后更新账号会员状态和到期时间。</Text></View>
      </View>

      <View className="notice-card">
        <Text className="notice-title">说明</Text>
        <Text className="notice-text">本页仅用于人工服务说明，不展示电商订单、线上支付或虚拟商品交易流程。</Text>
      </View>

      <View className="feedback-entry" onClick={() => Taro.navigateTo({ url: '/pages/settings/feedback/index' })}>
        <View>
          <Text className="feedback-title">暂时没有客服二维码？</Text>
          <Text className="feedback-desc">可通过意见反馈留下联系方式。</Text>
        </View>
        <Text className="feedback-arrow">›</Text>
      </View>
    </View>
  )
}

export default MembershipOpenPage
