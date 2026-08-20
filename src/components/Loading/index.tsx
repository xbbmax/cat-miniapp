import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface LoadingProps {
  text?: string
  fullPage?: boolean
}

const Loading: React.FC<LoadingProps> = ({ text = '加载中...', fullPage = false }) => {
  return (
    <View className={`loading-container ${fullPage ? 'loading-fullpage' : ''}`}>
      <View className="loading-spinner" />
      <View className="loading-text">{text}</View>
    </View>
  )
}

export default Loading
