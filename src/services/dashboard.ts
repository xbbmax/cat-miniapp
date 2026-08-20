import { api } from './api'
import type { DashboardData } from '@/types'

export const dashboardApi = {
  // 获取仪表盘数据
  getData: () =>
    api.get<DashboardData>('/home/dashboard'),
}
