import React, { useCallback, useEffect, useState } from 'react'
import { View, Input, Button, Picker, Textarea, Switch, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { vaccinesApi } from '@/services/health'
import { petsApi } from '@/services/pets'
import FormItem from '@/components/FormItem'
import Loading from '@/components/Loading'
import type { Pet } from '@/types'
import './index.scss'

interface VaccineFormState {
  petId: string
  petIdx: number
  vaccineName: string
  brand: string
  dose: string
  batchNumber: string
  vaccinationDate: string
  nextVaccinationDate: string
  reminderEnabled: boolean
  reminderDays: string
  hospital: string
  doctor: string
  veterinarian: string
  notes: string
}

const initialForm: VaccineFormState = {
  petId: '',
  petIdx: 0,
  vaccineName: '',
  brand: '',
  dose: '',
  batchNumber: '',
  vaccinationDate: new Date().toISOString().slice(0, 10),
  nextVaccinationDate: '',
  reminderEnabled: true,
  reminderDays: '30',
  hospital: '',
  doctor: '',
  veterinarian: '',
  notes: '',
}

const VaccineAddPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [pets, setPets] = useState<Pet[]>([])
  const [form, setForm] = useState<VaccineFormState>(initialForm)

  const updateForm = <Key extends keyof VaccineFormState>(key: Key, value: VaccineFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑疫苗' : '添加疫苗' })
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
      const res = await vaccinesApi.getDetail(id)
      if (res.success && res.data) {
        const vaccine = res.data
        const petIdx = pets.findIndex((pet) => pet.id === vaccine.petId)
        setForm({
          petId: vaccine.petId,
          petIdx: petIdx >= 0 ? petIdx : 0,
          vaccineName: vaccine.vaccineName,
          brand: vaccine.brand || '',
          dose: vaccine.dose || '',
          batchNumber: vaccine.batchNumber || '',
          vaccinationDate: vaccine.vaccinationDate?.slice(0, 10) || '',
          nextVaccinationDate: vaccine.nextVaccinationDate?.slice(0, 10) || '',
          reminderEnabled: vaccine.reminderEnabled,
          reminderDays: vaccine.reminderDays?.toString() || '30',
          hospital: vaccine.hospital || '',
          doctor: vaccine.doctor || '',
          veterinarian: vaccine.veterinarian || '',
          notes: vaccine.notes || '',
        })
      } else {
        Taro.showToast({ title: res.error || '疫苗记录加载失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [id, pets])

  useEffect(() => { fetchDetail() }, [fetchDetail])

  const buildPayload = () => {
    if (!form.petId) {
      Taro.showToast({ title: '请选择宠物', icon: 'none' })
      return undefined
    }
    if (!form.vaccineName.trim()) {
      Taro.showToast({ title: '请输入疫苗名称', icon: 'none' })
      return undefined
    }
    if (!form.vaccinationDate) {
      Taro.showToast({ title: '请选择接种日期', icon: 'none' })
      return undefined
    }
    if (form.nextVaccinationDate && form.nextVaccinationDate < form.vaccinationDate) {
      Taro.showToast({ title: '下次接种不能早于本次接种', icon: 'none' })
      return undefined
    }

    let reminderDays: number | undefined
    if (form.reminderEnabled) {
      reminderDays = Number(form.reminderDays || '30')
      if (!Number.isInteger(reminderDays) || reminderDays < 1 || reminderDays > 365) {
        Taro.showToast({ title: '提醒天数需为 1-365 天', icon: 'none' })
        return undefined
      }
    }

    return {
      petId: form.petId,
      vaccineName: form.vaccineName.trim(),
      brand: form.brand.trim() || undefined,
      dose: form.dose.trim() || undefined,
      batchNumber: form.batchNumber.trim() || undefined,
      vaccinationDate: form.vaccinationDate,
      nextVaccinationDate: form.nextVaccinationDate || undefined,
      reminderEnabled: form.reminderEnabled,
      reminderDays,
      hospital: form.hospital.trim() || form.veterinarian.trim() || undefined,
      doctor: form.doctor.trim() || undefined,
      veterinarian: form.veterinarian.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    const payload = buildPayload()
    if (!payload) return

    setSubmitting(true)
    try {
      const res = isEdit && id ? await vaccinesApi.update(id, payload) : await vaccinesApi.create(payload)
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
    <View className="page-container vaccine-form-page">
      <View className="form-hero">
        <Text className="hero-kicker">{isEdit ? '编辑记录' : '新建记录'}</Text>
        <Text className="hero-title">{isEdit ? '更新疫苗接种信息' : '添加一条疫苗记录'}</Text>
        <Text className="hero-desc">记录接种日期、医院医生和下次接种提醒，方便后续按宠物追踪。</Text>
      </View>

      <View className="form-card">
        <Text className="form-section-title">接种对象</Text>
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
        <Text className="form-section-title">疫苗信息</Text>
        <FormItem label="疫苗名称" required>
          <Input className="form-input ui-input" value={form.vaccineName} placeholder="例如：狂犬疫苗、猫三联" onInput={(event) => updateForm('vaccineName', event.detail.value)} maxlength={80} />
        </FormItem>
        <FormItem label="品牌">
          <Input className="form-input ui-input" value={form.brand} placeholder="疫苗品牌" onInput={(event) => updateForm('brand', event.detail.value)} maxlength={80} />
        </FormItem>
        <FormItem label="剂量">
          <Input className="form-input ui-input" value={form.dose} placeholder="例如：1ml" onInput={(event) => updateForm('dose', event.detail.value)} maxlength={40} />
        </FormItem>
        <FormItem label="批次">
          <Input className="form-input ui-input" value={form.batchNumber} placeholder="疫苗批次号" onInput={(event) => updateForm('batchNumber', event.detail.value)} maxlength={80} />
        </FormItem>
      </View>

      <View className="form-card">
        <Text className="form-section-title">日期和提醒</Text>
        <FormItem label="接种日期" required>
          <Picker mode="date" value={form.vaccinationDate} onChange={(event) => updateForm('vaccinationDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.vaccinationDate || '选择日期'}</View>
          </Picker>
        </FormItem>
        <FormItem label="下次接种">
          <Picker mode="date" value={form.nextVaccinationDate} onChange={(event) => updateForm('nextVaccinationDate', event.detail.value)}>
            <View className="form-picker ui-picker">{form.nextVaccinationDate || '选择日期'}</View>
          </Picker>
        </FormItem>
        <FormItem label="提醒开关">
          <View className="switch-row">
            <Text className="switch-copy">{form.reminderEnabled ? '到期前提醒' : '不提醒'}</Text>
            <Switch checked={form.reminderEnabled} onChange={(event) => updateForm('reminderEnabled', event.detail.value)} color="#2F6B5F" />
          </View>
        </FormItem>
        {form.reminderEnabled && (
          <FormItem label="提前天数">
            <Input className="form-input ui-input" type="number" value={form.reminderDays} placeholder="默认 30 天" onInput={(event) => updateForm('reminderDays', event.detail.value)} />
          </FormItem>
        )}
      </View>

      <View className="form-card">
        <Text className="form-section-title">医院与备注</Text>
        <FormItem label="医院">
          <Input
            className="form-input ui-input"
            value={form.hospital || form.veterinarian}
            placeholder="医院名称"
            onInput={(event) => setForm((current) => ({ ...current, hospital: event.detail.value, veterinarian: event.detail.value }))}
            maxlength={100}
          />
        </FormItem>
        <FormItem label="医生">
          <Input className="form-input ui-input" value={form.doctor} placeholder="医生姓名" onInput={(event) => updateForm('doctor', event.detail.value)} maxlength={60} />
        </FormItem>
        <FormItem label="备注">
          <Textarea className="form-textarea ui-textarea" value={form.notes} placeholder="补充说明" onInput={(event) => updateForm('notes', event.detail.value)} maxlength={500} autoHeight />
        </FormItem>
      </View>

      <Button className="submit-btn ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
        {isEdit ? '保存修改' : '添加疫苗'}
      </Button>
    </View>
  )
}

export default VaccineAddPage
