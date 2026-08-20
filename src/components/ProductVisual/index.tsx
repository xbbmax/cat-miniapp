import React from 'react'
import { View, Image, Text } from '@tarojs/components'
import type { ProductCategory } from '@/types'
import { resolveProductTone } from '@/utils/productVisual'
import './index.scss'

interface ProductVisualProps {
  category?: Pick<ProductCategory, 'name' | 'imageUrl'> | null
  title?: string
  subtitle?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const ProductVisual: React.FC<ProductVisualProps> = ({
  category,
  title,
  subtitle,
  size = 'md',
  className = '',
}) => {
  const tone = resolveProductTone(category)
  const showCopy = size !== 'sm' && (title || subtitle)

  return (
    <View
      className={`product-visual product-visual--${size} ${className}`.trim()}
      style={{ backgroundColor: tone.accent }}
    >
      <Image className="product-visual-image" src={tone.image} mode="aspectFill" />
      <View className="product-visual-mask" />
      <View className="product-visual-chip">{tone.badge}</View>
      {showCopy && (
        <View className="product-visual-copy">
          {title && <Text className="product-visual-title">{title}</Text>}
          {subtitle && <Text className="product-visual-subtitle">{subtitle}</Text>}
        </View>
      )}
    </View>
  )
}

export default ProductVisual

