// 後端 API 回應專用型別 (DTO)

// 補充描述
export interface ApiSupplement {
  content: string
  attachmentUrls: string[]
  createdAt: string
}

// 維修訂單
export interface ApiRepairOrder {
  id: string
  userId: string
  category: string
  title: string
  description: string
  deviceType: string
  attachmentUrls: string[]
  supplements: ApiSupplement[]
  repairContent?: string
  notes?: string
  status: string
  createdAt: string
  updatedAt: string
}

// 回覆
export interface ApiReply {
  id: string
  repairOrderId: string
  adminId: string
  adminName?: string
  adminAvatar?: string
  content: string
  createdAt: string
  updatedAt: string
}

// 含使用者資訊的維修訂單 (後台用)
export interface ApiRepairOrderWithUser extends ApiRepairOrder {
  userName: string
  userAvatar: string
}

// 後台使用者管理相關
export interface ApiUser {
  id: string
  lineUserId: string | null
  displayName: string
  avatarUrl: string
  status: 'active' | 'inactive'
  createdAt: string
  lastLoginAt: string | null
}

// 後台管理者管理相關
export interface ApiAdmin {
  id: string
  username: string
  displayName: string
  avatarUrl: string
  role: 'super_admin' | 'admin' | 'moderator'
  status: 'active' | 'inactive'
  createdAt: string
  lastLoginAt: string | null
}

// 儀表板統計
export interface DashboardStats {
  totalOrders: number
  totalUsers: number
  recentOrders: number
  statusCounts: Record<string, number>
  deviceTypeCounts: Record<string, number>
  categoryStats: { category: string; count: number }[]
}

