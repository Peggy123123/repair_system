import { User } from '../frontend'

// 後台管理者資料類型
export interface Admin {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  role: 'super_admin' | 'admin' | 'moderator'
  status: 'active' | 'inactive'
  lastLoginAt: string
}

// 後台使用者管理類型（擴展前台User）
export interface AdminUser extends User {
  status: 'active' | 'inactive'
  createdAt: string
  lastLoginAt: string
}

// 重新導出前台型別供後台使用
export type { RepairRequest, Reply, RepairStatus, RepairStatusConfig } from '../frontend'
export { REPAIR_STATUS_CONFIG } from '../frontend'
