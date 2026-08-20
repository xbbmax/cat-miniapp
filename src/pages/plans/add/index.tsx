import React, { useCallback, useEffect, useState } from 'react'
import { Button, Input, Picker, Switch, Text, Textarea, View } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { plansApi } from '@/services/health'
import { petsApi } from '@/services/pets'
import FormItem from '@/components/FormItem'
import Loading from '@/components/Loading'
import type { Pet } from '@/types'
import './index.scss'

type PlanType = 'vaccine' | 'deworming' | 'checkup' | 'grooming' | 'other'
type PlanFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
type PlanStatus = 'active' | 'completed' | 'paused'
type ReminderMethod = 'weapp' | 'inApp'

const TYPES: Array<{ value: PlanType; label: string }> = [
  { value: 'vaccine', label: '疫苗' },
  { value: 'deworming', label: '驱虫' },
  { value: 'checkup', label: '体检' },
  { value: 'grooming', label: '护理' },
  { value: 'other', label: '其他' },
]

const FREQUENCIES: Array<{ value: PlanFrequency; label: string }> = [
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
  { value: 'quarterly', label: '每季度' },
  { value: 'yearly', label: '每年' },
  { value: 'custom', label: '自定义' },
]

const REMINDER_METHODS: Array<{ value: ReminderMethod; label: string }> = [
  { value: 'weapp', label: '小程序提醒' },
  { value: 'inApp', label: '站内信提醒' },
]

const STATUS_OPTIONS: Array<{ value: PlanStatus; label: string }> = [
  { value: 'active', label: '进行中' },
  { value: 'paused', label: '已暂停' },
  { value: 'completed', label: '已完成' },
]

const today = new Date().toISOString().slice(0, 10)

interface PlanFormState {
  petId: string
  petIdx: number
  planName: string
  planType: PlanType
  planTypeIdx: number
  frequency: PlanFrequency
  frequencyIdx: number
  customDays: string
  startDate: string
  endDate: string
  reminderEnabled: boolean
  reminderDays: string
  reminderMethod: ReminderMethod
  reminderMethodIdx: number
  status: PlanStatus
  statusIdx: number
  notes: string
}

const initialForm: PlanFormState = {
  petId: '',
  petIdx: 0,
  planName: '',
  planType: 'vaccine',
  planTypeIdx: 0,
  frequency: 'monthly',
  frequencyIdx: 2,
  customDays: '',
  startDate: today,
  endDate: '',
  reminderEnabled: true,
  reminderDays: '7',
  reminderMethod: 'weapp',
  reminderMethodIdx: 0,
  status: 'active',
  statusIdx: 0,
  notes: '',
}

const PlanAddPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [form, setForm] = useState<PlanFormState>(initialForm)

  const updateForm = <Key extends keyof PlanFormState>(key: Key, value: PlanFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑计划' : '新建计划' })
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
      const res = await plansApi.getDetail(id)
      if (res.success && res.data) {
        const plan = res.data
        const petIdx = pets.findIndex((pet) => pet.id === plan.petId)
        const planTypeIdx = TYPES.findIndex((item) => item.value === plan.planType)
        const frequencyIdx = FREQUENCIES.findIndex((item) => item.value === plan.frequency)
        const reminderMethod = plan.reminderMethod === 'inApp' ? 'inApp' : 'weapp'
        const reminderMethodIdx = REMINDER_METHODS.findIndex((item) => item.value === reminderMethod)
        const status = plan.status || 'active'
        const statusIdx = STATUS_OPTIONS.findIndex((item) => item.value === status)

        setForm({
          petId: plan.petId,
          petIdx: petIdx >= 0 ? petIdx : 0,
          planName: plan.planName,
          planType: plan.planType,
          planTypeIdx: planTypeIdx >= 0 ? planTypeIdx : 0,
          frequency: plan.frequency,
          frequencyIdx: frequencyIdx >= 0 ? frequencyIdx : 2,
          customDays: plan.customDays?.toString() || '',
          startDate: plan.startDate?.slice(0, 10) || today,
          endDate: plan.endDate?.slice(0, 10) || '',
          reminderEnabled: plan.reminderEnabled,
          reminderDays: plan.reminderDays?.toString() || '7',
          reminderMethod,
          reminderMethodIdx: reminderMethodIdx >= 0 ? reminderMethodIdx : 0,
          status,
          statusIdx: statusIdx >= 0 ? statusIdx : 0,
          notes: plan.notes || '',
        })
      } else {
        Taro.showToast({ title: res.error || '健康计划加载失败', icon: 'none' })
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
    if (!form.planName.trim()) {
      Taro.showToast({ title: '请输入计划名称', icon: 'none' })
      return undefined
    }
    if (!form.startDate) {
      Taro.showToast({ title: '请选择开始时间', icon: 'none' })
      return undefined
    }
    if (form.endDate && form.endDate < form.startDate) {
      Taro.showToast({ title: '结束时间不能早于开始时间', icon: 'none' })
      return undefined
    }

    let customDays: number | undefined
    if (form.frequency === 'custom') {
      customDays = Number(form.customDays)
      if (!Number.isInteger(customDays) || customDays < 1 || customDays > 365) {
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
      planName: form.planName.trim(),
      planType: form.planType,
      frequency: form.frequency,
      customDays,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      reminderEnabled: form.reminderEnabled,
      reminderDays,
      reminderMethod: form.reminderMethod,
      status: form.status,
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
        ? await plansApi.update(id, payload)
        : await plansApi.create(payload)
      if (res.success) {
        Taro.showToast({ title: isEdit ? '保存成功' : '创建成功', icon: 'success' })
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
    <View className="page-container plan-form-page">
      <View className="form-hero">
        <Text className="hero-kicker">{isEdit ? '编辑计划' : '新建计划'}</Text>
        <Text className="hero-title">{isEdit ? '更新健康计划' : '安排下一次健康照护'}</Text>
        <Text className="hero-desc">为疫苗、驱虫、体检和护理建立周期计划，到期前自动提醒。</Text>
      </View>

      <View className="form-card">
        <Text className="form-section-title">计划对象</Text>
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
        <FormItem label="计划名称" required>
          <Input className="form-input ui-input" value={form.planName} placeholder="例如：年度体检、每月驱虫" onInput={(event) => updateForm('planName', event.detail.value)} maxlength={100} />
        </FormItem>
        <FormItem label="目标类型">
          <Picker
            mode="selector"
            range={TYPES}
            rangeKey="label"
            value={form.planTypeIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, planTypeIdx: index, planType: TYPES[index].value }))
            }}
          >
            <View className="form-picker ui-picker">{TYPES[form.planTypeIdx]?.label}</View>
          </Picker>
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">执行周期</Text>
        <FormItem label="重复规则">
          <Picker
            mode="selector"
            range={FREQUENCIES}
            rangeKey="label"
            value={form.frequencyIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, frequencyIdx: index, frequency: FREQUENCIES[index].value }))
            }}
          >
            <View className="form-picker ui-picker">{FREQUENCIES[form.frequencyIdx]?.label}</View>
          </Picker>
        </FormItem>
        {form.frequency === 'custom' && (
          <FormItem label="自定义天数">
            <Input className="form-input ui-input" type="number" value={form.customDays} placeholder="例如：45" onInput={(event) => updateForm('customDays', event.detail.value)} />
          </FormItem>
        )}
        <FormItem label="开始时间" required>
          <Picker mode="date" value={form.startDate || today} onChange={(event) => updateForm('startDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.startDate || '选择日期'}</View>
          </Picker>
        </FormItem>
        <FormItem label="结束时间">
          <Picker mode="date" value={form.endDate || today} onChange={(event) => updateForm('endDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.endDate || '不设置结束时间'}</View>
          </Picker>
        </FormItem>
        <FormItem label="计划状态">
          <Picker
            mode="selector"
            range={STATUS_OPTIONS}
            rangeKey="label"
            value={form.statusIdx}
            onChange={(event) => {
              const index = Number(event.detail.value)
              setForm((current) => ({ ...current, statusIdx: index, status: STATUS_OPTIONS[index].value }))
            }}
          >
            <View className="form-picker ui-picker">{STATUS_OPTIONS[form.statusIdx]?.label}</View>
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
          <FormItem label="提醒方式">
            <Picker
              mode="selector"
              range={REMINDER_METHODS}
              rangeKey="label"
              value={form.reminderMethodIdx}
              onChange={(event) => {
                const index = Number(event.detail.value)
                setForm((current) => ({
                  ...current,
                  reminderMethodIdx: index,
                  reminderMethod: REMINDER_METHODS[index].value,
                }))
              }}
            >
              <View className="form-picker ui-picker">{REMINDER_METHODS[form.reminderMethodIdx]?.label}</View>
            </Picker>
          </FormItem>
        )}
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
        {isEdit ? '保存修改' : '创建计划'}
      </Button>
    </View>
  )
}

export default PlanAddPage
