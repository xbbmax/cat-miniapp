import React from 'react'
import { View } from '@tarojs/components'
import './index.scss'

interface FormItemProps {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}

const FormItem: React.FC<FormItemProps> = ({ label, required = false, error, children }) => {
  return (
    <View className="form-item">
      <View className="form-label">
        {required && <View className="form-required">*</View>}
        {label}
      </View>
      <View className="form-control">{children}</View>
      {error && <View className="form-error">{error}</View>}
    </View>
  )
}

export default FormItem
