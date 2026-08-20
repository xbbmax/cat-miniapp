import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface EmptyStateProps {
  icon?: string
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '空',
  title = '暂无数据',
  description = '',
  actionText = '',
  onAction,
}) => {
  return (
    <View className="empty-state">
      <View className="empty-icon">{icon}</View>
      <View className="empty-title">{title}</View>
      {description && <View className="empty-desc">{description}</View>}
      {actionText && onAction && (
        <View className="empty-action" onClick={onAction}>
          {actionText}
        </View>
      )}
    </View>
  )
}

export default EmptyState
