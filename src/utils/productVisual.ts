import type { ProductCategory } from '@/types'
import defaultCover from '@/assets/product/product-default.png'
import foodCover from '@/assets/product/product-food.png'
import medicineCover from '@/assets/product/product-medicine.png'
import careCover from '@/assets/product/product-care.png'
import snackCover from '@/assets/product/product-snack.png'
import supplementCover from '@/assets/product/product-supplement.png'

export interface ProductVisualTone {
  image: string
  badge: string
  accent: string
  subtitle: string
}

const VISUAL_TONES: Array<{
  keywords: string[]
  tone: ProductVisualTone
}> = [
  {
    keywords: ['主粮', '粮', 'food', 'feed', 'foods'],
    tone: {
      image: foodCover,
      badge: '主粮',
      accent: '#F97316',
      subtitle: 'Daily food',
    },
  },
  {
    keywords: ['药', 'medicine', 'med', '驱虫', '疫苗'],
    tone: {
      image: medicineCover,
      badge: '药品',
      accent: '#EF4444',
      subtitle: 'Medicine care',
    },
  },
  {
    keywords: ['护理', 'care', '洗', '清洁', '美容'],
    tone: {
      image: careCover,
      badge: '护理',
      accent: '#10B981',
      subtitle: 'Daily care',
    },
  },
  {
    keywords: ['零食', 'snack', 'treat', '奖励'],
    tone: {
      image: snackCover,
      badge: '零食',
      accent: '#EC4899',
      subtitle: 'Snack time',
    },
  },
  {
    keywords: ['保健', 'supplement', '营养', '维生素', '健康'],
    tone: {
      image: supplementCover,
      badge: '保健',
      accent: '#0EA5E9',
      subtitle: 'Supplement',
    },
  },
]

export const DEFAULT_PRODUCT_TONE: ProductVisualTone = {
  image: defaultCover,
  badge: '库存',
  accent: '#6366F1',
  subtitle: 'Pet care',
}

const normalize = (value?: string | null) => (value || '').trim().toLowerCase()

export const resolveProductTone = (category?: Pick<ProductCategory, 'name' | 'imageUrl'> | null): ProductVisualTone => {
  if (category?.imageUrl) {
    return {
      image: category.imageUrl,
      badge: category.name || DEFAULT_PRODUCT_TONE.badge,
      accent: DEFAULT_PRODUCT_TONE.accent,
      subtitle: category.name || DEFAULT_PRODUCT_TONE.subtitle,
    }
  }

  const name = normalize(category?.name)
  const hit = VISUAL_TONES.find(({ keywords }) => keywords.some(keyword => name.includes(normalize(keyword))))
  if (hit) {
    return hit.tone
  }

  return DEFAULT_PRODUCT_TONE
}

