import { api } from './api'
import type { ApiResponse, Pet, PetGender, PetType, PaginationParams } from '@/types'

export interface CreatePetParams {
  name: string
  type: PetType
  breed?: string
  gender: PetGender
  birthday?: string
  weight?: number
  photo?: string
  isNeutered?: boolean
  allergies?: string
  chronicConditions?: string
  longTermMedication?: string
  specialCare?: string
  notes?: string
}

export type UpdatePetParams = Partial<CreatePetParams>

interface BackendPet {
  id?: string
  userId?: string
  name?: string
  type?: string
  breed?: string | null
  gender?: string | null
  birthday?: string | null
  weight?: string | number | null
  photo?: string | null
  sterilized?: boolean | null
  isNeutered?: boolean | null
  allergy?: string | null
  allergies?: string | null
  chronicDisease?: string | null
  chronicConditions?: string | null
  longTermMedication?: string | null
  specialCare?: string | null
  notes?: string | null
  createdAt?: string
  updatedAt?: string
}

interface PetDetailPayload {
  pet?: BackendPet
}

type BackendPetPayload = {
  name?: string
  type?: PetType
  breed?: string
  gender?: '公' | '母' | '其他'
  birthday?: string
  weight?: number
  photo?: string
  sterilized?: boolean
  allergy?: string
  chronicDisease?: string
  longTermMedication?: string
  specialCare?: string
  notes?: string
}

const toBackendGender = (gender?: PetGender): BackendPetPayload['gender'] => {
  if (gender === 'male') return '公'
  if (gender === 'female') return '母'
  if (gender === 'unknown') return '其他'
  return undefined
}

const fromBackendGender = (gender?: string | null): PetGender => {
  if (gender === '公' || gender === 'male') return 'male'
  if (gender === '母' || gender === 'female') return 'female'
  return 'unknown'
}

const toNumber = (value?: string | number | null): number | undefined => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

const toBackendPetPayload = (data: UpdatePetParams): BackendPetPayload => {
  const payload: BackendPetPayload = {}

  if (data.name !== undefined) payload.name = data.name
  if (data.type !== undefined) payload.type = data.type
  if (data.breed !== undefined) payload.breed = data.breed
  if (data.gender !== undefined) payload.gender = toBackendGender(data.gender)
  if (data.birthday !== undefined) payload.birthday = data.birthday
  if (data.weight !== undefined) payload.weight = data.weight
  if (data.photo !== undefined) payload.photo = data.photo
  if (data.isNeutered !== undefined) payload.sterilized = data.isNeutered
  if (data.allergies !== undefined) payload.allergy = data.allergies
  if (data.chronicConditions !== undefined) payload.chronicDisease = data.chronicConditions
  if (data.longTermMedication !== undefined) payload.longTermMedication = data.longTermMedication
  if (data.specialCare !== undefined) payload.specialCare = data.specialCare
  if (data.notes !== undefined) payload.notes = data.notes

  return payload
}

const fromBackendPet = (pet: BackendPet): Pet => ({
  id: pet.id || '',
  userId: pet.userId || '',
  name: pet.name || '',
  type: (pet.type || 'other') as PetType,
  breed: pet.breed || undefined,
  gender: fromBackendGender(pet.gender),
  birthday: pet.birthday || undefined,
  weight: toNumber(pet.weight),
  photo: pet.photo || undefined,
  isNeutered: Boolean(pet.sterilized ?? pet.isNeutered),
  allergies: pet.allergy || pet.allergies || undefined,
  chronicConditions: pet.chronicDisease || pet.chronicConditions || undefined,
  longTermMedication: pet.longTermMedication || undefined,
  specialCare: pet.specialCare || undefined,
  notes: pet.notes || undefined,
  createdAt: pet.createdAt || '',
  updatedAt: pet.updatedAt || '',
})

const getErrorMessage = (error: unknown): string | undefined => {
  if (!error) return undefined
  if (typeof error === 'string') return error
  if (typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message
    return typeof message === 'string' ? message : undefined
  }
  return '操作失败'
}

const normalizeResponse = <Input, Output>(
  response: ApiResponse<Input>,
  mapper: (data: Input) => Output
): ApiResponse<Output> => {
  if (!response.success || response.data === undefined) {
    return {
      success: false,
      error: getErrorMessage(response.error),
      message: response.message,
      pagination: response.pagination,
    }
  }

  return {
    ...response,
    data: mapper(response.data),
  }
}

const unwrapPetDetail = (data: BackendPet | PetDetailPayload): BackendPet => {
  if ('pet' in data && data.pet) return data.pet
  return data as BackendPet
}

export const petsApi = {
  // 获取宠物列表
  async getList(params?: PaginationParams) {
    const response = await api.get<BackendPet[]>('/pets', params)
    return normalizeResponse(response, (items) => items.map(fromBackendPet))
  },

  // 获取宠物详情
  async getDetail(id: string) {
    const response = await api.get<BackendPet | PetDetailPayload>(`/pets/${id}`)
    return normalizeResponse(response, (data) => fromBackendPet(unwrapPetDetail(data)))
  },

  // 创建宠物
  async create(data: CreatePetParams) {
    const response = await api.post<BackendPet>('/pets', toBackendPetPayload(data))
    return normalizeResponse(response, fromBackendPet)
  },

  // 更新宠物
  async update(id: string, data: UpdatePetParams) {
    const response = await api.put<BackendPet>(`/pets/${id}`, toBackendPetPayload(data))
    return normalizeResponse(response, fromBackendPet)
  },

  // 删除宠物
  delete: (id: string) =>
    api.delete(`/pets/${id}`),
}
