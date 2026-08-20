import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Picker, Switch, Text, Textarea, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { medicationsApi } from '@/services/health'
import { petsApi } from '@/services/pets'
import FormItem from '@/components/FormItem'
import Loading from '@/components/Loading'
import type { Pet } from '@/types'
import './index.scss'

type MedicationType = 'deworming' | 'treatment' | 'supplement' | 'other'

const TYPE_OPTIONS: Array<{ value: MedicationType; label: string }> = [
  { value: 'deworming', label: '驱虫' },
  { value: 'treatment', label: '治疗' },
  { value: 'supplement', label: '营养补充' },
  { value: 'other', label: '其他' },
]

const FREQ_OPTIONS = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'biweekly', label: '每两周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
  { value: 'yearly', label: '每年' },
  { value: 'custom', label: '自定义' },
]

const today = new Date().toISOString().slice(0, 10)

interface MedicationFormState {
  petId: string
  petIdx: number
  medicationName: string
  type: MedicationType
  typeIdx: number
  purpose: string
  dosage: string
  frequency: string
  freqIdx: number
  frequencyDays: string
  startDate: string
  endDate: string
  lastDoseDate: string
  nextDoseDate: string
  reminderEnabled: boolean
  reminderDays: string
  notes: string
}

const initialForm: MedicationFormState = {
  petId: '',
  petIdx: 0,
  medicationName: '',
  type: 'deworming',
  typeIdx: 0,
  purpose: '',
  dosage: '',
  frequency: 'monthly',
  freqIdx: 3,
  frequencyDays: '',
  startDate: today,
  endDate: '',
  lastDoseDate: today,
  nextDoseDate: '',
  reminderEnabled: true,
  reminderDays: '7',
  notes: '',
}

const MedicationAddPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [form, setForm] = useState<MedicationFormState>(initialForm)

  const updateForm = <Key extends keyof MedicationFormState>(key: Key, value: MedicationFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑用药' : '添加用药' })
  }, [isEdit])

  useEffect(() => {
    petsApi.getList().then((res) => {
      if (res.success && res.data) {
        setPets(res.data)
        if (res.data.length > 0) {
          setForm((current) => current.petId ? current : { ...current, petId: res.data[0].id })
        }
      }
    })
  }, [])

  const fetchDetail = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await medicationsApi.getDetail(id)
      if (res.success && res.data) {
        const medication = res.data
        const petIdx = pets.findIndex((pet) => pet.id === medication.petId)
        const typeIdx = TYPE_OPTIONS.findIndex((item) => item.value === medication.type)
        const freqIdx = FREQ_OPTIONS.findIndex((item) => item.value === medication.frequency)
        setForm({
          petId: medication.petId,
          petIdx: petIdx >= 0 ? petIdx : 0,
          medicationName: medication.medicationName,
          type: medication.type,
          typeIdx: typeIdx >= 0 ? typeIdx : 0,
          purpose: medication.purpose || '',
          dosage: medication.dosage || '',
          frequency: medication.frequency || 'monthly',
          freqIdx: freqIdx >= 0 ? freqIdx : 3,
          frequencyDays: medication.frequencyDays?.toString() || '',
          startDate: medication.startDate?.slice(0, 10) || medication.lastDoseDate?.slice(0, 10) || '',
          endDate: medication.endDate?.slice(0, 10) || '',
          lastDoseDate: medication.lastDoseDate?.slice(0, 10) || '',
          nextDoseDate: medication.nextDoseDate?.slice(0, 10) || '',
          reminderEnabled: medication.reminderEnabled,
          reminderDays: medication.reminderDays?.toString() || '7',
          notes: medication.notes || '',
        })
      } else {
        Taro.showToast({ title: res.error || '用药记录加载失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [id, pets])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const buildPayload = () => {
    if (!form.petId) {
      Taro.showToast({ title: '请选择宠物', icon: 'none' })
      return undefined
    }
    if (!form.medicationName.trim()) {
      Taro.showToast({ title: '请输入药品名称', icon: 'none' })
      return undefined
    }
    if (!form.lastDoseDate) {
      Taro.showToast({ title: '请选择上次用药日期', icon: 'none' })
      return undefined
    }
    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      Taro.showToast({ title: '结束时间不能早于开始时间', icon: 'none' })
      return undefined
    }
    if (form.nextDoseDate && form.nextDoseDate < form.lastDoseDate) {
      Taro.showToast({ title: '下次用药不能早于上次用药', icon: 'none' })
      return undefined
    }

    let frequencyDays: number | undefined
    if (form.frequency === 'custom') {
      frequencyDays = Number(form.frequencyDays)
      if (!Number.isInteger(frequencyDays) || frequencyDays < 1 || frequencyDays > 365) {
        Taro.showToast({ title: '自定义频率需为 1-365 天', icon: 'none' })
        return undefined
      }
    }

    let reminderDays: number | undefined
    if (form.reminderEnabled) {
      reminderDays = Number(form.reminderDays || '7')
      if (!Number.isInteger(reminderDays) || reminderDays < 1 || reminderDays > 365) {
        Taro.showToast({ title: '提醒天数需为 1-365 天', icon: 'none' })
        return undefined
      }
    }

    return {
      petId: form.petId,
      medicationName: form.medicationName.trim(),
      type: form.type,
      purpose: form.purpose.trim() || undefined,
      dosage: form.dosage.trim() || undefined,
      frequency: form.frequency,
      frequencyDays,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      lastDoseDate: form.lastDoseDate,
      nextDoseDate: form.nextDoseDate || undefined,
      reminderEnabled: form.reminderEnabled,
      reminderDays,
      notes: form.notes.trim() || undefined,
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    const payload = buildPayload()
    if (!payload) return

    setSubmitting(true)
    try {
      const res = isEdit && id
        ? await medicationsApi.update(id, payload)
        : await medicationsApi.create(payload)
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
    <View className="page-container medication-form-page">
      <View className="form-hero">
        <Text className="hero-kicker">{isEdit ? '编辑记录' : '新建记录'}</Text>
        <Text className="hero-title">{isEdit ? '更新用药信息' : '添加一条用药记录'}</Text>
        <Text className="hero-desc">记录驱虫、治疗用药和营养补充，按周期设置下一次提醒。</Text>
      </View>

      <View className="form-card">
        <Text className="form-section-title">用药对象</Text>
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
        <Text className="form-section-title">药品信息</Text>
        <FormItem label="药品名称" required>
          <Input className="form-input ui-input" value={form.medicationName} placeholder="例如：驱虫药、消炎药" onInput={(event) => updateForm('medicationName', event.detail.value)} maxlength={100} />
        </FormItem>
        <FormItem label="类型">
          <Picker
            mode="selector"
            range={TYPE_OPTIONS}
            rangeKey="label"
            value={form.typeIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, typeIdx: index, type: TYPE_OPTIONS[index].value }))
            }}
          >
            <View className="form-picker ui-picker">{TYPE_OPTIONS[form.typeIdx]?.label}</View>
          </Picker>
        </FormItem>
        <FormItem label="用途">
          <Input className="form-input ui-input" value={form.purpose} placeholder="例如：体内驱虫、消炎、补充营养" onInput={(event) => updateForm('purpose', event.detail.value)} maxlength={120} />
        </FormItem>
        <FormItem label="剂量">
          <Input className="form-input ui-input" value={form.dosage} placeholder="例如：1片 / 2ml" onInput={(event) => updateForm('dosage', event.detail.value)} maxlength={80} />
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">周期和日期</Text>
        <FormItem label="频率">
          <Picker
            mode="selector"
            range={FREQ_OPTIONS}
            rangeKey="label"
            value={form.freqIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, freqIdx: index, frequency: FREQ_OPTIONS[index].value }))
            }}
          >
            <View className="form-picker ui-picker">{FREQ_OPTIONS[form.freqIdx]?.label}</View>
          </Picker>
        </FormItem>
        {form.frequency === 'custom' && (
          <FormItem label="自定义天数">
            <Input className="form-input ui-input" type="number" value={form.frequencyDays} placeholder="例如：5" onInput={(event) => updateForm('frequencyDays', event.detail.value)} />
          </FormItem>
        )}
        <FormItem label="开始时间">
          <Picker mode="date" value={form.startDate || today} onChange={(event) => updateForm('startDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.startDate || '选择日期'}</View>
          </Picker>
        </FormItem>
        <FormItem label="结束时间">
          <Picker mode="date" value={form.endDate || today} onChange={(event) => updateForm('endDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.endDate || '不设置结束时间'}</View>
          </Picker>
        </FormItem>
        <FormItem label="上次用药" required>
          <Picker mode="date" value={form.lastDoseDate || today} onChange={(event) => updateForm('lastDoseDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.lastDoseDate || '选择日期'}</View>
          </Picker>
        </FormItem>
        <FormItem label="下次用药">
          <Picker mode="date" value={form.nextDoseDate || today} onChange={(event) => updateForm('nextDoseDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.nextDoseDate || '选择日期'}</View>
          </Picker>
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">提醒和备注</Text>
        <FormItem label="提醒开关">
          <View className="switch-row">
            <Text className="switch-copy">{form.reminderEnabled ? '到期前提醒' : '不提醒'}</Text>
            <Switch checked={form.reminderEnabled} onChange={(event) => updateForm('reminderEnabled', event.detail.value)} color="#2F6B5F" />
          </View>
        </FormItem>
        {form.reminderEnabled && (
          <FormItem label="提前天数">
            <Input className="form-input ui-input" type="number" value={form.reminderDays} placeholder="默认 7 天" onInput={(event) => updateForm('reminderDays', event.detail.value)} />
          </FormItem>
        )}
        <FormItem label="备注">
          <Textarea className="form-textarea ui-textarea" value={form.notes} placeholder="补充说明" onInput={(event) => updateForm('notes', event.detail.value)} maxlength={500} autoHeight />
        </FormItem>
      </View>

      <Button className="submit-btn ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? '保存修改' : '添加用药'}
      </Button>
    </View>
  )
}

export default MedicationAddPage
