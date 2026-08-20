import { api } from './api'
import type { ApiResponse, Pet, Product, ProductCategory, PaginationParams } from '@/types'

export interface CreateProductParams {
  name: string
  categoryId?: string
  customCategoryName?: string
  batchNumber?: string
  specification?: string
  startDate: string
  endDate: string
  quantity?: number
  reminderEnabled?: boolean
  reminderDays?: number
  notes?: string
  petIds?: string[]
}

export interface UpdateProductParams extends Partial<CreateProductParams> {
  isOpened?: boolean
  openedAt?: string
  status?: 'active' | 'expired' | 'depleted'
  categoryType?: 'preset' | 'custom'
}

interface BackendProduct {
  id?: string
  userId?: string
  name?: string
  categoryId?: string | null
  category?: ProductCategory | null
  batchNumber?: string | null
  specification?: string | null
  customCategoryName?: string | null
  categoryType?: 'preset' | 'custom' | null
  startDate?: string
  endDate?: string
  isOpened?: boolean | null
  openedAt?: string | null
  isUsedUp?: boolean | null
  quantity?: number | null
  reminderEnabled?: boolean | null
  reminderDaysBefore?: number | null
  remainingDays?: number | null
  notes?: string | null
  status?: 'active' | 'expired' | 'depleted' | null
  pets?: Pick<Pet, 'id' | 'name' | 'type'>[] | null
  createdAt?: string
  updatedAt?: string
}

type BackendProductPayload = {
  name?: string
  categoryId?: string
  customCategoryName?: string
  batchNumber?: string
  specification?: string
  categoryType?: 'preset' | 'custom'
  startDate?: string
  endDate?: string
  quantity?: number
  isOpened?: boolean
  openedAt?: string
  isUsedUp?: boolean
  status?: 'active' | 'expired' | 'depleted'
  reminderEnabled?: boolean
  reminderDaysBefore?: number
  notes?: string
  petIds?: string[]
}

const toBackendProductPayload = (data: UpdateProductParams): BackendProductPayload => {
  const payload: BackendProductPayload = {}

  if (data.name !== undefined) payload.name = data.name
  if (data.categoryId !== undefined) payload.categoryId = data.categoryId
  if (data.customCategoryName !== undefined) payload.customCategoryName = data.customCategoryName
  if (data.batchNumber !== undefined) payload.batchNumber = data.batchNumber
  if (data.specification !== undefined) payload.specification = data.specification
  if (data.categoryType !== undefined) payload.categoryType = data.categoryType
  if (data.startDate !== undefined) payload.startDate = data.startDate
  if (data.endDate !== undefined) payload.endDate = data.endDate
  if (data.quantity !== undefined) payload.quantity = data.quantity
  if (data.isOpened !== undefined) payload.isOpened = data.isOpened
  if (data.openedAt !== undefined) payload.openedAt = data.openedAt
  if (data.status !== undefined) {
    payload.status = data.status
    payload.isUsedUp = data.status === 'depleted'
  }
  if (data.reminderEnabled !== undefined) payload.reminderEnabled = data.reminderEnabled
  if (data.reminderDays !== undefined) payload.reminderDaysBefore = data.reminderDays
  if (data.notes !== undefined) payload.notes = data.notes
  if (data.petIds !== undefined) payload.petIds = data.petIds

  return payload
}

const fromBackendProduct = (product: BackendProduct): Product => ({
  id: product.id || '',
  userId: product.userId || '',
  name: product.name || '',
  categoryId: product.categoryId || undefined,
  category: product.category || undefined,
  batchNumber: product.batchNumber || undefined,
  specification: product.specification || undefined,
  customCategoryName: product.customCategoryName || undefined,
  categoryType: product.categoryType || undefined,
  startDate: product.startDate || '',
  endDate: product.endDate || '',
  isOpened: Boolean(product.isOpened),
  openedAt: product.openedAt || undefined,
  quantity: product.quantity ?? undefined,
  reminderEnabled: product.reminderEnabled ?? false,
  reminderDays: product.reminderDaysBefore ?? undefined,
  remainingDays: product.remainingDays ?? undefined,
  notes: product.notes || undefined,
  status: product.status || (product.isUsedUp ? 'depleted' : 'active'),
  pets: product.pets || undefined,
  createdAt: product.createdAt || '',
  updatedAt: product.updatedAt || '',
})

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

export const productsApi = {
  async getList(params?: PaginationParams) {
    const response = await api.get<BackendProduct[]>('/products', params)
    return normalizeResponse(response, (products) => products.map(fromBackendProduct))
  },

  async getDetail(id: string) {
    const response = await api.get<BackendProduct>(`/products/${id}`)
    return normalizeResponse(response, fromBackendProduct)
  },

  async create(data: CreateProductParams) {
    const response = await api.post<BackendProduct>('/products', toBackendProductPayload(data))
    return normalizeResponse(response, fromBackendProduct)
  },

  async update(id: string, data: UpdateProductParams) {
    const response = await api.put<BackendProduct>(`/products/${id}`, toBackendProductPayload(data))
    return normalizeResponse(response, fromBackendProduct)
  },

  delete: (id: string) =>
    api.delete(`/products/${id}`),

  getCategories: () =>
    api.get<ProductCategory[]>('/categories'),
}
