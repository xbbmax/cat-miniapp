import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Picker, Text, Textarea, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { recordsApi } from '@/services/health'
import { petsApi } from '@/services/pets'
import FormItem from '@/components/FormItem'
import Loading from '@/components/Loading'
import type { Pet } from '@/types'
import './index.scss'

type RecordType = 'weight' | 'temperature' | 'symptom' | 'checkup' | 'treatment' | 'other'

const RECORD_TYPES: Array<{ value: RecordType; label: string; placeholder: string }> = [
  { value: 'weight', label: '体重', placeholder: '例如：5.2kg' },
  { value: 'temperature', label: '体温', placeholder: '例如：38.5°C' },
  { value: 'symptom', label: '症状', placeholder: '例如：食欲下降、打喷嚏' },
  { value: 'checkup', label: '体检', placeholder: '例如：血常规正常' },
  { value: 'treatment', label: '治疗', placeholder: '例如：连续治疗第 3 天' },
  { value: 'other', label: '其他', placeholder: '填写本次结果或数据' },
]

const today = new Date().toISOString().slice(0, 10)

interface RecordFormState {
  petId: string
  petIdx: number
  recordType: RecordType
  typeIdx: number
  recordDate: string
  value: string
  notes: string
  imageReserved: boolean
}

const initialForm: RecordFormState = {
  petId: '',
  petIdx: 0,
  recordType: 'checkup',
  typeIdx: 3,
  recordDate: today,
  value: '',
  notes: '',
  imageReserved: false,
}

const RecordDetailPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id
  const isNew = !id || id === 'new'
  const isEdit = !isNew
  const [loading, setLoading] = useState(isEdit)
  const [submitting, setSubmitting] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [form, setForm] = useState<RecordFormState>(initialForm)

  const updateForm = <Key extends keyof RecordFormState>(key: Key, value: RecordFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑健康记录' : '添加健康记录' })
  }, [isEdit])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const petsResult = await petsApi.getList()
      const nextPets = petsResult.success && petsResult.data ? petsResult.data : []
      setPets(nextPets)

      if (isNew) {
        if (nextPets.length > 0) updateForm('petId', nextPets[0].id)
        return
      }

      const recordResult = await recordsApi.getDetail(id)
      if (recordResult.success && recordResult.data) {
        const record = recordResult.data
        const petIdx = nextPets.findIndex((pet) => pet.id === record.petId)
        const typeIdx = RECORD_TYPES.findIndex((item) => item.value === record.recordType)
        setForm({
          petId: record.petId,
          petIdx: petIdx >= 0 ? petIdx : 0,
          recordType: record.recordType,
          typeIdx: typeIdx >= 0 ? typeIdx : 5,
          recordDate: record.recordDate?.slice(0, 10) || today,
          value: record.value || '',
          notes: record.notes || '',
          imageReserved: Boolean(record.imageReserved || record.mediaUrls?.length),
        })
      } else {
        Taro.showToast({ title: recordResult.error || '健康记录加载失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [id, isNew])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async () => {
    if (submitting) return
    if (!form.petId) {
      Taro.showToast({ title: '请选择宠物', icon: 'none' })
      return
    }
    if (!form.recordDate) {
      Taro.showToast({ title: '请选择记录日期', icon: 'none' })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        petId: form.petId,
        recordType: form.recordType,
        recordDate: form.recordDate,
        value: form.value.trim() || undefined,
        notes: form.notes.trim() || undefined,
        imageReserved: form.imageReserved,
      }
      const result = isEdit && id
        ? await recordsApi.update(id, payload)
        : await recordsApi.create(payload)
      if (result.success) {
        Taro.showToast({ title: isEdit ? '保存成功' : '添加成功', icon: 'success' })
        setTimeout(() => Taro.navigateBack(), 500)
      } else {
        Taro.showToast({ title: result.error || '操作失败', icon: 'none' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = () => {
    Taro.showModal({
      title: '删除健康记录',
      content: '确定删除该健康记录吗？',
      confirmColor: '#D84A4A',
      success: async (res) => {
        if (!res.confirm || !id) return
        const result = await recordsApi.delete(id)
        if (result.success) {
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 500)
        } else {
          Taro.showToast({ title: result.error || '删除失败', icon: 'none' })
        }
      },
    })
  }

  if (loading) return <View className="page-container"><Loading fullPage /></View>

  const recordType = RECORD_TYPES[form.typeIdx] || RECORD_TYPES[5]

  return (
    <View className="page-container record-form-page">
      <View className="form-hero">
        <Text className="hero-kicker">{isEdit ? '编辑记录' : '新建记录'}</Text>
        <Text className="hero-title">{isEdit ? '更新健康信息' : '留下一条健康观察'}</Text>
        <Text className="hero-desc">当前以文字和数据记录为主，图片上传能力已预留，后续开放。</Text>
      </View>

      <View className="form-card">
        <Text className="form-section-title">记录对象</Text>
        <FormItem label="宠物" required>
          <Picker
            mode="selector"
            range={pets}
            rangeKey="name"
            value={form.petIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, petIdx: index, petId: pets[index]?.id || '' }))
            }}
          >
            <View className="form-picker ui-picker">{pets[form.petIdx]?.name || '请选择宠物'}</View>
          </Picker>
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">记录内容</Text>
        <FormItem label="类型">
          <Picker
            mode="selector"
            range={RECORD_TYPES}
            rangeKey="label"
            value={form.typeIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, typeIdx: index, recordType: RECORD_TYPES[index].value }))
            }}
          >
            <View className="form-picker ui-picker">{recordType.label}</View>
          </Picker>
        </FormItem>
        <FormItem label="记录日期" required>
          <Picker mode="date" value={form.recordDate || today} onChange={(event) => updateForm('recordDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.recordDate || '选择日期'}</View>
          </Picker>
        </FormItem>
        <FormItem label="数值或结果">
          <Input className="form-input ui-input" value={form.value} placeholder={recordType.placeholder} onInput={(event) => updateForm('value', event.detail.value)} maxlength={160} />
        </FormItem>
        <FormItem label="备注">
          <Textarea className="form-textarea ui-textarea" value={form.notes} placeholder="补充本次观察、检查结果或医嘱" onInput={(event) => updateForm('notes', event.detail.value)} maxlength={500} autoHeight />
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">图片上传预留</Text>
        <View className="media-reserved-row">
          <View>
            <Text className="media-reserved-title">健康图片与检查报告</Text>
            <Text className="media-reserved-desc">
              {form.imageReserved ? '该记录已保留图片数据字段。' : '当前版本暂不上传图片，后续可直接接入。'}
            </Text>
          </View>
          <Text className="media-reserved-tag">预留</Text>
        </View>
      </View>

      {isEdit && (
        <Button className="delete-btn ui-danger-btn" onClick={handleDelete}>删除记录</Button>
      )}
      <Button className="submit-btn ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? '保存修改' : '添加记录'}
      </Button>
    </View>
  )
}

export default RecordDetailPage
