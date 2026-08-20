import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  color?: string
  onClick?: () => void
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color = '#FF6B5B', onClick }) => {
  return (
    <View className="stat-card" onClick={onClick}>
      <View className="stat-icon" style={{ backgroundColor: color + '15' }}>
        <View className="stat-emoji">{icon}</View>
      </View>
      <View className="stat-value" style={{ color }}>{value}</View>
      <View className="stat-label">{label}</View>
    </View>
  )
}

export default StatCard
