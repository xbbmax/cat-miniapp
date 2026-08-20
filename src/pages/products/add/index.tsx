import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Input, Button, Picker, Textarea, Switch, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { productsApi } from '@/services/products'
import { petsApi } from '@/services/pets'
import FormItem from '@/components/FormItem'
import Loading from '@/components/Loading'
import ProductVisual from '@/components/ProductVisual'
import type { Pet, ProductCategory } from '@/types'
import './index.scss'

interface ProductFormState {
  name: string
  categoryId: string
  customCategoryName: string
  batchNumber: string
  specification: string
  startDate: string
  endDate: string
  quantity: string
  reminderEnabled: boolean
  reminderDays: string
  notes: string
  petIds: string[]
}

const initialForm: ProductFormState = {
  name: '',
  categoryId: '',
  customCategoryName: '',
  batchNumber: '',
  specification: '',
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
  quantity: '',
  reminderEnabled: true,
  reminderDays: '30',
  notes: '',
  petIds: [],
}

const ProductAddPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [pets, setPets] = useState<Pet[]>([])
  const [detailCategory, setDetailCategory] = useState<ProductCategory | null>(null)
  const [form, setForm] = useState<ProductFormState>(initialForm)

  const updateForm = <Key extends keyof ProductFormState>(key: Key, value: ProductFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    productsApi.getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data)
        if (res.data.length > 0) {
          setForm((prev) => (prev.categoryId ? prev : { ...prev, categoryId: res.data[0].id }))
        }
      }
    })
    petsApi.getList().then((res) => {
      if (res.success && res.data) setPets(res.data)
    })
  }, [])

  const fetchProduct = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await productsApi.getDetail(id)
      if (res.success && res.data) {
        const product = res.data
        setDetailCategory(product.category || null)
        setForm({
          name: product.name || '',
          categoryId: product.categoryId || '',
          customCategoryName: product.customCategoryName || '',
          batchNumber: product.batchNumber || '',
          specification: product.specification || '',
          startDate: product.startDate?.slice(0, 10) || '',
          endDate: product.endDate?.slice(0, 10) || '',
          quantity: product.quantity?.toString() || '',
          reminderEnabled: product.reminderEnabled ?? true,
          reminderDays: product.reminderDays?.toString() || '30',
          notes: product.notes || '',
          petIds: product.pets?.map((pet) => pet.id) || [],
        })
      } else {
        Taro.showToast({ title: res.error || '产品信息加载失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑产品' : '添加产品' })
    fetchProduct()
  }, [fetchProduct, isEdit])

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === form.categoryId) || detailCategory,
    [categories, detailCategory, form.categoryId]
  )
  const selectedCategoryName = selectedCategory?.name || form.customCategoryName || '未设置分类'

  const buildPayload = () => {
    const name = form.name.trim()
    const quantityText = form.quantity.trim()
    const reminderDaysText = form.reminderDays.trim()

    if (!name) {
      Taro.showToast({ title: '请输入产品名称', icon: 'none' })
      return undefined
    }

    if (!form.endDate) {
      Taro.showToast({ title: '请选择过期日期', icon: 'none' })
      return undefined
    }

    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      Taro.showToast({ title: '过期日期不能早于生产日期', icon: 'none' })
      return undefined
    }

    let quantity: number | undefined
    if (quantityText) {
      quantity = Number(quantityText)
      if (!Number.isFinite(quantity) || quantity < 0) {
        Taro.showToast({ title: '数量需填写非负数字', icon: 'none' })
        return undefined
      }
    }

    let reminderDays: number | undefined
    if (form.reminderEnabled) {
      reminderDays = Number(reminderDaysText || '30')
      if (!Number.isInteger(reminderDays) || reminderDays < 1 || reminderDays > 365) {
        Taro.showToast({ title: '提醒天数需为 1-365 天', icon: 'none' })
        return undefined
      }
    }

    return {
      name,
      categoryId: form.categoryId || undefined,
      customCategoryName: form.customCategoryName.trim() || undefined,
      batchNumber: form.batchNumber.trim() || undefined,
      specification: form.specification.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      quantity,
      reminderEnabled: form.reminderEnabled,
      reminderDays,
      notes: form.notes.trim() || undefined,
      petIds: form.petIds.length > 0 ? form.petIds : undefined,
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    const payload = buildPayload()
    if (!payload) return

    setSubmitting(true)
    try {
      const res = isEdit && id ? await productsApi.update(id, payload) : await productsApi.create(payload)
      if (res.success) {
        Taro.showToast({ title: isEdit ? '保存成功' : '添加成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 500)
      } else {
        Taro.showToast({ title: res.error || '操作失败', icon: 'none' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  return (
    <View className="page-container product-form-page">
      <View className="form-hero">
        <Text className="hero-kicker">{isEdit ? '编辑库存' : '新建库存'}</Text>
        <Text className="hero-title">{isEdit ? '更新产品效期信息' : '添加一个产品'}</Text>
        <Text className="hero-desc">记录生产/过期日期、开封状态和提醒设置，避免宠物用品过期后继续使用。</Text>
      </View>

      <View className="product-preview">
        <ProductVisual
          category={selectedCategory}
          title={form.name || '产品预览'}
          subtitle={selectedCategoryName}
          size="md"
        />
        <View className="product-preview-text">
          <Text className="product-preview-title">库存预览</Text>
          <Text className="product-preview-desc">
            {categories.length > 0 ? '选择分类后，预览图会自动切换。' : '没有预制分类时，可先填写自定义分类。'}
          </Text>
        </View>
      </View>

      <View className="form-card">
        <Text className="form-section-title">基础信息</Text>
        <FormItem label="产品名称" required>
          <Input className="form-input ui-input" value={form.name} placeholder="请输入产品名称" onInput={(event) => updateForm('name', event.detail.value)} maxlength={100} />
        </FormItem>

        <FormItem label="产品分类">
          {categories.length > 0 ? (
            <Picker
              mode="selector"
              range={categories}
              rangeKey="name"
              value={Math.max(0, categories.findIndex((item) => item.id === form.categoryId))}
              onChange={(event) => {
                const index = Number(event.detail.value)
                updateForm('categoryId', categories[index]?.id || '')
              }}
            >
              <View className="form-picker ui-picker">{selectedCategoryName}</View>
            </Picker>
          ) : (
            <View className="form-picker ui-picker empty-picker">暂无可选分类</View>
          )}
        </FormItem>

        <FormItem label="自定义分类">
          <Input className="form-input ui-input" value={form.customCategoryName} placeholder="预制分类不够时可填写" onInput={(event) => updateForm('customCategoryName', event.detail.value)} maxlength={50} />
        </FormItem>

        <FormItem label="批次号">
          <Input className="form-input ui-input" value={form.batchNumber} placeholder="可选填写" onInput={(event) => updateForm('batchNumber', event.detail.value)} maxlength={80} />
        </FormItem>

        <FormItem label="规格">
          <Input className="form-input ui-input" value={form.specification} placeholder="例如：100ml / 10片" onInput={(event) => updateForm('specification', event.detail.value)} maxlength={80} />
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">日期和提醒</Text>
        <FormItem label="生产日期">
          <Picker mode="date" value={form.startDate} onChange={(event) => updateForm('startDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.startDate || '请选择日期'}</View>
          </Picker>
        </FormItem>

        <FormItem label="过期日期" required>
          <Picker mode="date" value={form.endDate} onChange={(event) => updateForm('endDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.endDate || '请选择日期'}</View>
          </Picker>
        </FormItem>

        <FormItem label="数量">
          <Input className="form-input ui-input" type="digit" value={form.quantity} placeholder="可选填写" onInput={(event) => updateForm('quantity', event.detail.value)} />
        </FormItem>

        <FormItem label="提醒开关">
          <View className="switch-row">
            <Text className="switch-copy">{form.reminderEnabled ? '到期前提醒' : '不提醒'}</Text>
            <Switch checked={form.reminderEnabled} onChange={(event) => updateForm('reminderEnabled', event.detail.value)} color="#2F6B5F" />
          </View>
        </FormItem>

        {form.reminderEnabled && (
          <FormItem label="提前提醒天数">
            <Input className="form-input ui-input" type="number" value={form.reminderDays} placeholder="默认 30 天" onInput={(event) => updateForm('reminderDays', event.detail.value)} />
          </FormItem>
        )}
      </View>

      <View className="form-card">
        <Text className="form-section-title">关联与备注</Text>
        <FormItem label="关联宠物">
          {pets.length > 0 ? (
            <View className="pet-chips">
              {pets.map((pet) => (
                <View
                  key={pet.id}
                  className={`pet-chip ${form.petIds.includes(pet.id) ? 'active' : ''}`}
                  onClick={() => {
                    const nextPetIds = form.petIds.includes(pet.id)
                      ? form.petIds.filter((petId) => petId !== pet.id)
                      : [...form.petIds, pet.id]
                    updateForm('petIds', nextPetIds)
                  }}
                >
                  {pet.name}
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-related">暂无宠物，可先保存产品后再关联。</View>
          )}
        </FormItem>

        <FormItem label="备注">
          <Textarea className="form-textarea ui-textarea" value={form.notes} placeholder="补充说明" onInput={(event) => updateForm('notes', event.detail.value)} maxlength={500} autoHeight />
        </FormItem>
      </View>

      <Button className="submit-btn ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? '保存修改' : '添加产品'}
      </Button>
    </View>
  )
}

export default ProductAddPage
