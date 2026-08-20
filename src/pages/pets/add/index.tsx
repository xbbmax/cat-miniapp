import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Input, Button, Picker, Textarea, Switch, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { petsApi, type CreatePetParams } from '@/services/pets'
import FormItem from '@/components/FormItem'
import Loading from '@/components/Loading'
import type { PetGender, PetType } from '@/types'
import './index.scss'

const PET_TYPES: Array<{ value: PetType; label: string }> = [
  { value: 'cat', label: '猫' },
  { value: 'dog', label: '狗' },
  { value: 'rabbit', label: '兔子' },
  { value: 'bird', label: '鸟类' },
  { value: 'hamster', label: '仓鼠' },
  { value: 'turtle', label: '乌龟' },
  { value: 'fish', label: '鱼类' },
  { value: 'other', label: '其他' },
]

const GENDERS: Array<{ value: PetGender; label: string }> = [
  { value: 'male', label: '公' },
  { value: 'female', label: '母' },
  { value: 'unknown', label: '未知' },
]

interface PetFormState {
  name: string
  type: PetType
  breed: string
  gender: PetGender
  birthday: string
  weight: string
  isNeutered: boolean
  allergies: string
  chronicConditions: string
  longTermMedication: string
  specialCare: string
  notes: string
}

const initialForm: PetFormState = {
  name: '',
  type: 'cat',
  breed: '',
  gender: 'unknown',
  birthday: '',
  weight: '',
  isNeutered: false,
  allergies: '',
  chronicConditions: '',
  longTermMedication: '',
  specialCare: '',
  notes: '',
}

const PetAddPage: React.FC = () => {
  const router = useRouter()
  const id = router.params?.id
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [photoPending, setPhotoPending] = useState(false)
  const [form, setForm] = useState<PetFormState>(initialForm)

  const selectedType = useMemo(
    () => PET_TYPES.find((item) => item.value === form.type) || PET_TYPES[0],
    [form.type]
  )
  const selectedGender = useMemo(
    () => GENDERS.find((item) => item.value === form.gender) || GENDERS[2],
    [form.gender]
  )

  const updateForm = <Key extends keyof PetFormState>(key: Key, value: PetFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const fetchPet = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await petsApi.getDetail(id)
      if (res.success && res.data) {
        const pet = res.data
        setForm({
          name: pet.name || '',
          type: pet.type || 'cat',
          breed: pet.breed || '',
          gender: pet.gender || 'unknown',
          birthday: pet.birthday || '',
          weight: pet.weight?.toString() || '',
          isNeutered: Boolean(pet.isNeutered),
          allergies: pet.allergies || '',
          chronicConditions: pet.chronicConditions || '',
          longTermMedication: pet.longTermMedication || '',
          specialCare: pet.specialCare || '',
          notes: pet.notes || '',
        })
      } else {
        Taro.showToast({ title: res.error || '宠物信息加载失败', icon: 'none' })
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    Taro.setNavigationBarTitle({ title: isEdit ? '编辑宠物' : '添加宠物' })
    fetchPet()
  }, [fetchPet, isEdit])

  const handleAvatarPlaceholder = () => {
    setPhotoPending(true)
    Taro.showToast({ title: '头像上传入口已预留，后续开放', icon: 'none' })
    setTimeout(() => setPhotoPending(false), 1200)
  }

  const buildPayload = (): CreatePetParams | undefined => {
    const name = form.name.trim()
    const breed = form.breed.trim()
    const weightText = form.weight.trim()

    if (!name) {
      Taro.showToast({ title: '请输入宠物名称', icon: 'none' })
      return undefined
    }

    if (!breed) {
      Taro.showToast({ title: '请输入宠物品种', icon: 'none' })
      return undefined
    }

    let weight: number | undefined
    if (weightText) {
      weight = Number(weightText)
      if (!Number.isFinite(weight) || weight < 0 || weight > 200) {
        Taro.showToast({ title: '体重需填写 0-200kg 的数字', icon: 'none' })
        return undefined
      }
    }

    return {
      name,
      type: form.type,
      breed,
      gender: form.gender,
      birthday: form.birthday || undefined,
      weight,
      isNeutered: form.isNeutered,
      allergies: form.allergies.trim() || undefined,
      chronicConditions: form.chronicConditions.trim() || undefined,
      longTermMedication: form.longTermMedication.trim() || undefined,
      specialCare: form.specialCare.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    const payload = buildPayload()
    if (!payload) return

    setSubmitting(true)
    try {
      const res = isEdit && id ? await petsApi.update(id, payload) : await petsApi.create(payload)
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
    <View className="page-container">
      <View className="form-hero">
        <Text className="hero-kicker">{isEdit ? '编辑档案' : '新建档案'}</Text>
        <Text className="hero-title">{isEdit ? '更新宠物基础资料' : '添加一只宠物'}</Text>
        <Text className="hero-desc">后续疫苗、用药、产品效期和健康记录都会关联到宠物档案。</Text>
      </View>

      <View className="profile-card">
        <View className="avatar-row">
          <View className="avatar-preview">🐾</View>
          <View className={`avatar-action ${photoPending ? 'pending' : ''}`} onClick={handleAvatarPlaceholder}>
            <Text>宠物头像预留</Text>
          </View>
        </View>

        <FormItem label="宠物名称" required>
          <Input
            className="profile-input ui-input"
            value={form.name}
            placeholder="请输入宠物名称"
            onInput={(event) => updateForm('name', event.detail.value)}
            maxlength={20}
          />
        </FormItem>

        <FormItem label="宠物类型" required>
          <Picker
            mode="selector"
            range={PET_TYPES}
            rangeKey="label"
            value={PET_TYPES.findIndex((item) => item.value === form.type)}
            onChange={(event) => updateForm('type', PET_TYPES[Number(event.detail.value)].value)}
          >
            <View className="readonly-field ui-picker">{selectedType.label}</View>
          </Picker>
        </FormItem>

        <FormItem label="品种" required>
          <Input
            className="profile-input ui-input"
            value={form.breed}
            placeholder="例如：英短、金毛、混血"
            onInput={(event) => updateForm('breed', event.detail.value)}
            maxlength={50}
          />
        </FormItem>

        <FormItem label="性别">
          <Picker
            mode="selector"
            range={GENDERS}
            rangeKey="label"
            value={GENDERS.findIndex((item) => item.value === form.gender)}
            onChange={(event) => updateForm('gender', GENDERS[Number(event.detail.value)].value)}
          >
            <View className="readonly-field ui-picker">{selectedGender.label}</View>
          </Picker>
        </FormItem>

        <FormItem label="生日">
          <Picker mode="date" value={form.birthday || ''} onChange={(event) => updateForm('birthday', event.detail.value)}>
            <View className="readonly-field ui-picker">{form.birthday || '请选择生日'}</View>
          </Picker>
        </FormItem>

        <FormItem label="体重(kg)">
          <Input
            className="profile-input ui-input"
            type="digit"
            value={form.weight}
            placeholder="请输入体重"
            onInput={(event) => updateForm('weight', event.detail.value)}
          />
        </FormItem>

        <View className="binding-section">
          <View className="binding-row">
            <Text className="binding-label">是否绝育</Text>
            <Switch checked={form.isNeutered} onChange={(event) => updateForm('isNeutered', event.detail.value)} color="#2F6B5F" />
          </View>
        </View>

        <FormItem label="过敏情况">
          <Textarea
            className="profile-textarea ui-textarea"
            value={form.allergies}
            placeholder="如有过敏情况请填写"
            onInput={(event) => updateForm('allergies', event.detail.value)}
            autoHeight
          />
        </FormItem>

        <FormItem label="慢病情况">
          <Textarea
            className="profile-textarea ui-textarea"
            value={form.chronicConditions}
            placeholder="如有慢性病请填写"
            onInput={(event) => updateForm('chronicConditions', event.detail.value)}
            autoHeight
          />
        </FormItem>

        <FormItem label="长期用药">
          <Textarea
            className="profile-textarea ui-textarea"
            value={form.longTermMedication}
            placeholder="如有长期用药请填写"
            onInput={(event) => updateForm('longTermMedication', event.detail.value)}
            autoHeight
          />
        </FormItem>

        <FormItem label="特殊护理">
          <Textarea
            className="profile-textarea ui-textarea"
            value={form.specialCare}
            placeholder="如有特殊护理请填写"
            onInput={(event) => updateForm('specialCare', event.detail.value)}
            autoHeight
          />
        </FormItem>

        <FormItem label="备注">
          <Textarea
            className="profile-textarea ui-textarea"
            value={form.notes}
            placeholder="补充说明"
            onInput={(event) => updateForm('notes', event.detail.value)}
            autoHeight
          />
        </FormItem>

        <Button className="profile-submit ui-primary-btn" onClick={handleSubmit} loading={submitting} disabled={submitting}>
          {isEdit ? '保存修改' : '添加宠物'}
        </Button>
      </View>
    </View>
  )
}

export default PetAddPage
