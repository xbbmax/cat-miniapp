import { api } from './api'
import type { ApiResponse, HealthPlan, HealthRecord, Medication, Pet, PaginationParams, Vaccine } from '@/types'

export interface CreateVaccineParams {
  petId: string
  vaccineName: string
  brand?: string
  dose?: string
  batchNumber?: string
  vaccinationDate: string
  nextVaccinationDate?: string
  reminderEnabled: boolean
  reminderDays?: number
  hospital?: string
  doctor?: string
  veterinarian?: string
  notes?: string
}

export type UpdateVaccineParams = Partial<CreateVaccineParams>

export interface CreateMedicationParams {
  petId: string
  medicationName: string
  type: 'deworming' | 'treatment' | 'supplement' | 'other'
  purpose?: string
  dosage?: string
  frequency?: string
  frequencyDays?: number
  startDate?: string
  endDate?: string
  lastDoseDate: string
  nextDoseDate?: string
  reminderEnabled: boolean
  reminderDays?: number
  notes?: string
}

export type UpdateMedicationParams = Partial<CreateMedicationParams>

export interface CreatePlanParams {
  petId: string
  planName: string
  planType: 'vaccine' | 'deworming' | 'checkup' | 'grooming' | 'other'
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
  customDays?: number
  startDate: string
  endDate?: string
  reminderEnabled: boolean
  reminderDays?: number
  reminderMethod?: 'weapp' | 'inApp' | 'email'
  status?: 'active' | 'completed' | 'paused'
  notes?: string
}

export type UpdatePlanParams = Partial<CreatePlanParams>

type PetSummary = Pick<Pet, 'id' | 'name' | 'type'>

interface BackendVaccine {
  id?: string
  petId?: string
  vaccineName?: string
  brand?: string | null
  dose?: string | null
  batchNumber?: string | null
  vaccinationDate?: string
  nextDate?: string | null
  reminderEnabled?: boolean | null
  reminderDaysBefore?: number | null
  hospital?: string | null
  doctor?: string | null
  note?: string | null
  createdAt?: string
  updatedAt?: string
  pet?: PetSummary | null
}

interface BackendMedication {
  id?: string
  petId?: string
  medicationType?: string | null
  productName?: string
  purpose?: string | null
  dosage?: string | null
  frequency?: string | null
  frequencyDays?: number | null
  startDate?: string | null
  endDate?: string | null
  medicationDate?: string
  nextDate?: string | null
  reminderEnabled?: boolean | null
  reminderDaysBefore?: number | null
  note?: string | null
  createdAt?: string
  updatedAt?: string
  pet?: PetSummary | null
}

interface BackendPlan {
  id?: string
  petId?: string
  planType?: string | null
  title?: string | null
  planName?: string | null
  frequency?: string | null
  customDays?: number | null
  endDate?: string | null
  description?: string | null
  planDate?: string
  advanceDays?: number | null
  repeatRule?: { reminderMethod?: 'weapp' | 'inApp' | 'email' } | null
  reminderEnabled?: boolean | null
  status?: string | null
  completedCount?: number | null
  totalCount?: number | null
  lastCompletedAt?: string | null
  createdAt?: string
  updatedAt?: string
  pet?: PetSummary | null
}

type BackendVaccinePayload = {
  petId?: string
  vaccineName?: string
  brand?: string
  dose?: string
  batchNumber?: string
  vaccinationDate?: string
  nextDate?: string
  reminderEnabled?: boolean
  reminderDaysBefore?: number
  hospital?: string
  doctor?: string
  note?: string
}

type BackendMedicationPayload = {
  petId?: string
  medicationType?: string
  productName?: string
  purpose?: string
  dosage?: string
  frequency?: string
  frequencyDays?: number
  startDate?: string
  endDate?: string
  medicationDate?: string
  nextDate?: string
  reminderEnabled?: boolean
  reminderDaysBefore?: number
  note?: string
}

type BackendPlanPayload = {
  petId?: string
  planType?: string
  title?: string
  planName?: string
  frequency?: CreatePlanParams['frequency']
  customDays?: number
  planDate?: string
  endDate?: string
  advanceDays?: number
  reminderEnabled?: boolean
  repeatRule?: { type: string; reminderMethod?: CreatePlanParams['reminderMethod'] }
  status?: CreatePlanParams['status']
  description?: string
}

const medicationTypeToBackend: Record<CreateMedicationParams['type'], string> = {
  deworming: '\u9a71\u866b',
  treatment: '\u6cbb\u7597\u7528\u836f',
  supplement: '\u4fdd\u5065\u54c1',
  other: '\u5176\u4ed6',
}

const medicationTypeFromBackend = (type?: string | null): Medication['type'] => {
  if (type === '\u9a71\u866b' || type === 'deworming') return 'deworming'
  if (type === '\u6cbb\u7597\u7528\u836f' || type === 'treatment') return 'treatment'
  if (type === '\u4fdd\u5065\u54c1' || type === 'supplement') return 'supplement'
  return 'other'
}

const planTypeToBackend: Record<CreatePlanParams['planType'], string> = {
  vaccine: '\u75ab\u82d7',
  deworming: '\u9a71\u866b',
  checkup: '\u4f53\u68c0',
  grooming: '\u62a4\u7406',
  other: '\u81ea\u5b9a\u4e49',
}

const planTypeFromBackend = (type?: string | null): HealthPlan['planType'] => {
  if (type === '\u75ab\u82d7' || type === 'vaccine') return 'vaccine'
  if (type === '\u9a71\u866b' || type === 'deworming') return 'deworming'
  if (type === '\u4f53\u68c0' || type === 'checkup') return 'checkup'
  if (type === '\u62a4\u7406' || type === 'grooming') return 'grooming'
  return 'other'
}

const toPlanStatus = (status?: string | null): NonNullable<HealthPlan['status']> => {
  if (status === 'completed' || status === '\u5df2\u5b8c\u6210') return 'completed'
  if (status === 'paused' || status === '\u5df2\u6682\u505c') return 'paused'
  return 'active'
}

const normalizeResponse = <Input, Output>(
  response: ApiResponse<Input>,
  mapper: (data: Input) => Output
): ApiResponse<Output> => {
  if (!response.success || response.data === undefined) {
    return {
      success: false,
      error: response.error,
      message: response.message,
      pagination: response.pagination,
    }
  }

  return { ...response, data: mapper(response.data) }
}

const toBackendVaccinePayload = (data: UpdateVaccineParams): BackendVaccinePayload => {
  const payload: BackendVaccinePayload = {}
  if (data.petId !== undefined) payload.petId = data.petId
  if (data.vaccineName !== undefined) payload.vaccineName = data.vaccineName
  if (data.brand !== undefined) payload.brand = data.brand
  if (data.dose !== undefined) payload.dose = data.dose
  if (data.batchNumber !== undefined) payload.batchNumber = data.batchNumber
  if (data.vaccinationDate !== undefined) payload.vaccinationDate = data.vaccinationDate
  if (data.nextVaccinationDate !== undefined) payload.nextDate = data.nextVaccinationDate
  if (data.reminderEnabled !== undefined) payload.reminderEnabled = data.reminderEnabled
  if (data.reminderDays !== undefined) payload.reminderDaysBefore = data.reminderDays
  if (data.hospital !== undefined) payload.hospital = data.hospital
  if (data.doctor !== undefined) payload.doctor = data.doctor
  if (data.notes !== undefined) payload.note = data.notes
  return payload
}

const fromBackendVaccine = (data: BackendVaccine): Vaccine => ({
  id: data.id || '',
  petId: data.petId || '',
  vaccineName: data.vaccineName || '',
  brand: data.brand || undefined,
  dose: data.dose || undefined,
  batchNumber: data.batchNumber || undefined,
  vaccinationDate: data.vaccinationDate || '',
  nextVaccinationDate: data.nextDate || undefined,
  reminderEnabled: data.reminderEnabled ?? false,
  reminderDays: data.reminderDaysBefore ?? undefined,
  hospital: data.hospital || undefined,
  doctor: data.doctor || undefined,
  veterinarian: data.hospital || undefined,
  notes: data.note || undefined,
  createdAt: data.createdAt || '',
  updatedAt: data.updatedAt || '',
  pet: data.pet || undefined,
})

const toBackendMedicationPayload = (data: UpdateMedicationParams): BackendMedicationPayload => {
  const payload: BackendMedicationPayload = {}
  if (data.petId !== undefined) payload.petId = data.petId
  if (data.medicationName !== undefined) payload.productName = data.medicationName
  if (data.type !== undefined) payload.medicationType = medicationTypeToBackend[data.type]
  if (data.purpose !== undefined) payload.purpose = data.purpose
  if (data.dosage !== undefined) payload.dosage = data.dosage
  if (data.frequency !== undefined) payload.frequency = data.frequency
  if (data.frequencyDays !== undefined) payload.frequencyDays = data.frequencyDays
  if (data.startDate !== undefined) payload.startDate = data.startDate
  if (data.endDate !== undefined) payload.endDate = data.endDate
  if (data.lastDoseDate !== undefined) payload.medicationDate = data.lastDoseDate
  if (data.nextDoseDate !== undefined) payload.nextDate = data.nextDoseDate
  if (data.reminderEnabled !== undefined) payload.reminderEnabled = data.reminderEnabled
  if (data.reminderDays !== undefined) payload.reminderDaysBefore = data.reminderDays
  if (data.notes !== undefined) payload.note = data.notes
  return payload
}

const fromBackendMedication = (data: BackendMedication): Medication => ({
  id: data.id || '',
  petId: data.petId || '',
  medicationName: data.productName || '',
  type: medicationTypeFromBackend(data.medicationType),
  purpose: data.purpose || undefined,
  dosage: data.dosage || undefined,
  frequency: data.frequency || undefined,
  frequencyDays: data.frequencyDays ?? undefined,
  startDate: data.startDate || undefined,
  endDate: data.endDate || undefined,
  lastDoseDate: data.medicationDate || '',
  nextDoseDate: data.nextDate || undefined,
  reminderEnabled: data.reminderEnabled ?? false,
  reminderDays: data.reminderDaysBefore ?? undefined,
  notes: data.note || undefined,
  createdAt: data.createdAt || '',
  updatedAt: data.updatedAt || '',
  pet: data.pet || undefined,
})

const toBackendPlanPayload = (data: UpdatePlanParams): BackendPlanPayload => {
  const payload: BackendPlanPayload = {}
  if (data.petId !== undefined) payload.petId = data.petId
  if (data.planType !== undefined) payload.planType = planTypeToBackend[data.planType]
  if (data.planName !== undefined) {
    payload.planName = data.planName
    payload.title = data.planName
  }
  if (data.frequency !== undefined) payload.frequency = data.frequency
  if (data.customDays !== undefined) payload.customDays = data.customDays
  if (data.startDate !== undefined) payload.planDate = data.startDate
  if (data.endDate !== undefined) payload.endDate = data.endDate
  if (data.reminderEnabled !== undefined) payload.reminderEnabled = data.reminderEnabled
  if (data.reminderDays !== undefined) payload.advanceDays = data.reminderDays
  if (data.reminderMethod !== undefined) {
    payload.repeatRule = { type: '\u81ea\u5b9a\u4e49', reminderMethod: data.reminderMethod }
  }
  if (data.status !== undefined) payload.status = data.status
  if (data.notes !== undefined) payload.description = data.notes
  return payload
}

const fromBackendPlan = (data: BackendPlan): HealthPlan => ({
  id: data.id || '',
  petId: data.petId || '',
  planName: data.planName || data.title || '',
  planType: planTypeFromBackend(data.planType),
  frequency: (data.frequency || 'monthly') as HealthPlan['frequency'],
  customDays: data.customDays ?? undefined,
  startDate: data.planDate || '',
  endDate: data.endDate || undefined,
  reminderEnabled: data.reminderEnabled ?? false,
  reminderDays: data.advanceDays ?? undefined,
  reminderMethod: data.repeatRule?.reminderMethod || 'weapp',
  status: toPlanStatus(data.status),
  notes: data.description || undefined,
  completedCount: data.completedCount ?? 0,
  totalCount: data.totalCount ?? 0,
  lastCompletedAt: data.lastCompletedAt || undefined,
  nextDueDate: data.planDate || undefined,
  createdAt: data.createdAt || '',
  updatedAt: data.updatedAt || '',
  pet: data.pet || undefined,
})

export const vaccinesApi = {
  async getList(params?: PaginationParams) {
    const response = await api.get<BackendVaccine[]>('/vaccines', params)
    return normalizeResponse(response, (items) => items.map(fromBackendVaccine))
  },

  async getDetail(id: string) {
    const response = await api.get<BackendVaccine>(`/vaccines/${id}`)
    return normalizeResponse(response, fromBackendVaccine)
  },

  async create(data: CreateVaccineParams) {
    const response = await api.post<BackendVaccine>('/vaccines', toBackendVaccinePayload(data))
    return normalizeResponse(response, fromBackendVaccine)
  },

  async update(id: string, data: UpdateVaccineParams) {
    const response = await api.put<BackendVaccine>(`/vaccines/${id}`, toBackendVaccinePayload(data))
    return normalizeResponse(response, fromBackendVaccine)
  },

  delete: (id: string) => api.delete(`/vaccines/${id}`),
}

export const medicationsApi = {
  async getList(params?: PaginationParams) {
    const response = await api.get<BackendMedication[]>('/medications', params)
    return normalizeResponse(response, (items) => items.map(fromBackendMedication))
  },

  async getDetail(id: string) {
    const response = await api.get<BackendMedication>(`/medications/${id}`)
    return normalizeResponse(response, fromBackendMedication)
  },

  async create(data: CreateMedicationParams) {
    const response = await api.post<BackendMedication>('/medications', toBackendMedicationPayload(data))
    return normalizeResponse(response, fromBackendMedication)
  },

  async update(id: string, data: UpdateMedicationParams) {
    const response = await api.put<BackendMedication>(`/medications/${id}`, toBackendMedicationPayload(data))
    return normalizeResponse(response, fromBackendMedication)
  },

  delete: (id: string) => api.delete(`/medications/${id}`),
}

export const plansApi = {
  async getList(params?: PaginationParams) {
    const response = await api.get<BackendPlan[]>('/plans', params)
    return normalizeResponse(response, (items) => items.map(fromBackendPlan))
  },

  async getDetail(id: string) {
    const response = await api.get<BackendPlan>(`/plans/${id}`)
    return normalizeResponse(response, fromBackendPlan)
  },

  async create(data: CreatePlanParams) {
    const response = await api.post<BackendPlan>('/plans', toBackendPlanPayload(data))
    return normalizeResponse(response, fromBackendPlan)
  },

  async update(id: string, data: UpdatePlanParams) {
    const response = await api.put<BackendPlan>(`/plans/${id}`, toBackendPlanPayload(data))
    return normalizeResponse(response, fromBackendPlan)
  },

  delete: (id: string) => api.delete(`/plans/${id}`),
}

export interface CreateRecordParams {
  petId: string
  recordType: HealthRecord['recordType']
  recordDate: string
  value?: string
  notes?: string
  mediaUrls?: string[]
  imageReserved?: boolean
  relatedReminderId?: string
}

export interface UpdateRecordParams extends Partial<CreateRecordParams> {}

interface BackendRecord {
  id?: string
  petId?: string
  recordType?: string | null
  title?: string | null
  description?: string | null
  value?: string | null
  mediaUrls?: string[] | null
  imageReserved?: boolean | null
  relatedReminderId?: string | null
  recordDate?: string
  note?: string | null
  createdAt?: string
  updatedAt?: string
  pet?: PetSummary | null
}

type BackendRecordPayload = {
  petId?: string
  recordType?: string
  title?: string
  description?: string
  value?: string
  mediaUrls?: string[]
  imageReserved?: boolean
  relatedReminderId?: string
  recordDate?: string
  note?: string
}

const recordTypeToBackend: Record<HealthRecord['recordType'], string> = {
  weight: '\u4f53\u91cd',
  temperature: '\u4f53\u6e29',
  symptom: '\u5f02\u5e38',
  checkup: '\u4f53\u68c0',
  treatment: '\u7528\u836f',
  other: '\u81ea\u5b9a\u4e49',
}

const recordTypeFromBackend = (type?: string | null): HealthRecord['recordType'] => {
  if (type === '\u4f53\u91cd' || type === 'weight') return 'weight'
  if (type === '\u4f53\u6e29' || type === 'temperature') return 'temperature'
  if (type === '\u5f02\u5e38' || type === 'symptom') return 'symptom'
  if (type === '\u4f53\u68c0' || type === 'checkup') return 'checkup'
  if (type === '\u7528\u836f' || type === 'treatment') return 'treatment'
  return 'other'
}

const recordTitleByType: Record<HealthRecord['recordType'], string> = {
  weight: '\u4f53\u91cd\u8bb0\u5f55',
  temperature: '\u4f53\u6e29\u8bb0\u5f55',
  symptom: '\u75c7\u72b6\u8bb0\u5f55',
  checkup: '\u4f53\u68c0\u8bb0\u5f55',
  treatment: '\u6cbb\u7597\u8bb0\u5f55',
  other: '\u5065\u5eb7\u8bb0\u5f55',
}

const toBackendRecordPayload = (data: UpdateRecordParams): BackendRecordPayload => {
  const payload: BackendRecordPayload = {}
  if (data.petId !== undefined) payload.petId = data.petId
  if (data.recordType !== undefined) {
    payload.recordType = recordTypeToBackend[data.recordType]
    payload.title = recordTitleByType[data.recordType]
  }
  if (data.recordDate !== undefined) payload.recordDate = data.recordDate
  if (data.value !== undefined) payload.value = data.value
  if (data.notes !== undefined) {
    payload.note = data.notes
    payload.description = data.notes
  }
  if (data.mediaUrls !== undefined) payload.mediaUrls = data.mediaUrls
  if (data.imageReserved !== undefined) payload.imageReserved = data.imageReserved
  if (data.relatedReminderId !== undefined) payload.relatedReminderId = data.relatedReminderId
  return payload
}

const fromBackendRecord = (data: BackendRecord): HealthRecord => ({
  id: data.id || '',
  petId: data.petId || '',
  recordType: recordTypeFromBackend(data.recordType),
  recordDate: data.recordDate || '',
  value: data.value || undefined,
  notes: data.note || data.description || undefined,
  mediaUrls: data.mediaUrls || undefined,
  imageReserved: data.imageReserved ?? false,
  relatedReminderId: data.relatedReminderId || undefined,
  createdAt: data.createdAt || '',
  updatedAt: data.updatedAt || '',
  pet: data.pet || undefined,
})

export const recordsApi = {
  async getList(params?: PaginationParams) {
    const query = params?.type ? { ...params, recordType: params.type } : params
    const response = await api.get<BackendRecord[]>('/records', query)
    return normalizeResponse(response, (items) => items.map(fromBackendRecord))
  },

  async getDetail(id: string) {
    const response = await api.get<BackendRecord>(`/records/${id}`)
    return normalizeResponse(response, fromBackendRecord)
  },

  async create(data: CreateRecordParams) {
    const response = await api.post<BackendRecord>('/records', toBackendRecordPayload(data))
    return normalizeResponse(response, fromBackendRecord)
  },

  async update(id: string, data: UpdateRecordParams) {
    const response = await api.put<BackendRecord>(`/records/${id}`, toBackendRecordPayload(data))
    return normalizeResponse(response, fromBackendRecord)
  },

  delete: (id: string) =>
    api.delete(`/records/${id}`),
}
