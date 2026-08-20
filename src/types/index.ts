// 数据库表结构映射类型
// 宠物类型枚举
export type PetType = 'cat' | 'dog' | 'rabbit' | 'bird' | 'hamster' | 'turtle' | 'fish' | 'other'
// 宠物性别
export type PetGender = 'male' | 'female' | 'unknown'

// 用户
export interface User {
  id: string
  email: string
  nickname?: string
  avatar?: string
  phone?: string
  role: 'user' | 'admin'
  reminderEnabled: boolean
  reminderAdvanceDays: number
  membershipStatus?: 'free' | 'paid'
  membershipExpiresAt?: string
  membershipOpenedAt?: string
  wechatBound?: boolean
  phoneBound?: boolean
  wechatNickname?: string
  bindingStatus?: 'unbound' | 'bound' | 'pending'
  createdAt: string
  updatedAt: string
}

// 宠物
export interface Pet {
  id: string
  userId: string
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
  createdAt: string
  updatedAt: string
}

// 疫苗记录
export interface Vaccine {
  id: string
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
  createdAt: string
  updatedAt: string
  pet?: Pick<Pet, 'id' | 'name' | 'type'>
}

// 用药/驱虫记录
export interface Medication {
  id: string
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
  createdAt: string
  updatedAt: string
  pet?: Pick<Pet, 'id' | 'name' | 'type'>
}

// 产品分类
export interface ProductCategory {
  id: string
  name: string
  description?: string
  imageUrl?: string
  shelfLifeDays?: number
  openedShelfLifeDays?: number
  sortOrder: number
  createdAt: string
}

// 保健/用品产品
export interface Product {
  id: string
  userId: string
  name: string
  categoryId?: string
  category?: ProductCategory
  batchNumber?: string
  specification?: string
  customCategoryName?: string
  startDate: string
  endDate: string
  isOpened: boolean
  openedAt?: string
  quantity?: number
  reminderEnabled?: boolean
  reminderDays?: number
  categoryType?: 'preset' | 'custom'
  remainingDays?: number
  notes?: string
  status: 'active' | 'expired' | 'depleted'
  createdAt: string
  updatedAt: string
  pets?: Pick<Pet, 'id' | 'name' | 'type'>[]
}

// 健康计划
export interface HealthPlan {
  id: string
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
  completedCount: number
  totalCount: number
  lastCompletedAt?: string
  nextDueDate?: string
  createdAt: string
  updatedAt: string
  pet?: Pick<Pet, 'id' | 'name' | 'type'>
}

// 健康记录
export interface HealthRecord {
  id: string
  petId: string
  recordType: 'weight' | 'temperature' | 'symptom' | 'checkup' | 'treatment' | 'other'
  recordDate: string
  value?: string
  notes?: string
  mediaUrls?: string[]
  imageReserved?: boolean
  relatedReminderId?: string
  createdAt: string
  updatedAt: string
  pet?: Pick<Pet, 'id' | 'name' | 'type'>
}

// 通知
export interface Notification {
  id: string
  userId: string
  type: 'product_expiry' | 'vaccine_reminder' | 'medication_reminder' | 'plan_reminder' | 'system'
  title: string
  message: string
  relatedId?: string
  relatedType?: string
  isRead: boolean
  createdAt: string
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// 仪表盘数据
export interface DashboardData {
  petCount: number
  activeProductCount: number
  expiringProductCount: number
  expiredProductCount: number
  recentPets?: Pet[]
  upcomingVaccines: Vaccine[]
  upcomingMedications: Medication[]
  recentNotifications: Notification[]
  productStats: {
    active: number
    expiring: number
    expired: number
  }
  membershipStatus?: 'free' | 'paid'
  membershipExpiresAt?: string
}

// 分页查询参数
export interface PaginationParams {
  page?: number
  pageSize?: number
  status?: string
  search?: string
  petId?: string
  type?: string
  category?: string
}
