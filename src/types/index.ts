// 使用者資料類型
export interface User {
  id: string
  lineUserId: string | null
  displayName: string
  avatarUrl: string
}

// 維修狀態類型
export type RepairStatus = 'pending' | 'in_progress' | 'repairing' | 'completed' | 'cancelled'

// 維修申請類型
export interface RepairRequest {
  id: string
  userId: string
  category: string
  title: string // 報修主題
  description: string // 報修描述
  attachmentUrl?: string // 保留向後相容
  attachmentUrls?: string[] // 多張圖片支援
  status: RepairStatus
  createdAt: string
  updatedAt: string
}

// 回覆類型
export interface Reply {
  id: string
  repairRequestId: string
  adminId: string
  content: string
  createdAt: string
}

// 維修設備類型
export interface DeviceType {
  id: string
  name: string
  icon: string
}

export const DEVICE_TYPES: DeviceType[] = [
  { id: 'mac', name: 'MAC', icon: 'desktop' },
  { id: 'laptop', name: '筆電', icon: 'laptop' },
  { id: 'computer', name: '電腦', icon: 'computer' }
]

// 維修細項分類
export interface RepairSubCategory {
  id: string
  name: string
  icon: string
  deviceTypes: string[] // 支援的設備類型
}

export const REPAIR_SUB_CATEGORIES: RepairSubCategory[] = [
  { id: 'crash', name: '當機', icon: 'fa-solid fa-laptop', deviceTypes: ['mac', 'laptop', 'computer'] },
  { id: 'keyboard', name: '鍵盤損壞', icon: 'keyboard', deviceTypes: ['laptop', 'computer'] },
  { id: 'screen', name: '螢幕損壞', icon: 'tv', deviceTypes: ['mac', 'laptop', 'computer'] },
  { id: 'motherboard', name: '主機板維修', icon: 'microchip', deviceTypes: ['mac', 'laptop', 'computer'] },
  { id: 'speaker', name: '喇叭損壞', icon: 'volume-up', deviceTypes: ['mac', 'laptop', 'computer'] },
  { id: 'other', name: '其他', icon: 'fa-solid fa-wrench', deviceTypes: ['mac', 'laptop', 'computer'] }
]

// 維修類別 (保留舊的以向後相容)
export const REPAIR_CATEGORIES = [
  '硬體故障',
  '軟體問題',
  '系統重灌',
  '資料救援',
  '網路問題',
  '其他'
] as const

export type RepairCategory = typeof REPAIR_CATEGORIES[number]

// 維修狀態配置
export interface RepairStatusConfig {
  id: RepairStatus
  label: string
  color: string
  bgColor: string
  count: number
}

// 維修狀態配置映射
export const REPAIR_STATUS_CONFIG: Record<RepairStatus, Omit<RepairStatusConfig, 'count'>> = {
  pending: {
    id: 'pending',
    label: '待處理',
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  in_progress: {
    id: 'in_progress',
    label: '處理中',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  repairing: {
    id: 'repairing',
    label: '維修中',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  completed: {
    id: 'completed',
    label: '已完成',
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  cancelled: {
    id: 'cancelled',
    label: '已取消',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
}
