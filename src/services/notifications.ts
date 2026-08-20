import { api } from './api'
import type { ApiResponse, Notification, PaginationParams } from '@/types'

interface NotificationListResult {
  items?: Notification[]
  total?: number
  page?: number
  pageSize?: number
  totalPages?: number
}

interface UnreadCountResult {
  count?: number
  unreadCount?: number
}

export const notificationsApi = {
  // 获取通知列表
  getList: async (params?: PaginationParams): Promise<ApiResponse<Notification[]>> => {
    const res = await api.get<Notification[] | NotificationListResult>('/notifications', params)
    if (!res.success) return res as ApiResponse<Notification[]>

    const data = res.data
    const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : []

    return {
      ...res,
      data: list,
      pagination: Array.isArray(data) ? res.pagination : {
        page: data?.page || 1,
        pageSize: data?.pageSize || list.length,
        total: data?.total || list.length,
        totalPages: data?.totalPages || 1,
      },
    }
  },

  // 标记已读
  markAsRead: (id: string) =>
    api.put(`/notifications/${id}/read`),

  // 标记全部已读
  markAllAsRead: () =>
    api.put('/notifications/read-all'),

  // 获取未读数量
  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    const res = await api.get<UnreadCountResult>('/notifications/unread-count')
    if (!res.success) return res as ApiResponse<{ count: number }>

    return {
      ...res,
      data: {
        count: res.data?.count ?? res.data?.unreadCount ?? 0,
      },
    }
  },
}
