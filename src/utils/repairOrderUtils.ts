import type { RepairOrder, Reply, RepairSupplement } from '@/types'

/**
 * 生成唯一 ID
 */
const generateId = (): string => {
  // 優先使用 crypto.randomUUID()，否則使用備用方案
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // 備用方案：時間戳 + 隨機字串
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * 生成新的維修訂單
 */
export const createRepairOrder = (order: Omit<RepairOrder, 'id' | 'createdAt' | 'updatedAt'>): RepairOrder => {
  return {
    ...order,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * 生成新的回覆
 */
export const createReply = (reply: Omit<Reply, 'id' | 'createdAt'>): Reply => {
  return {
    ...reply,
    id: generateId(),
    createdAt: new Date().toISOString()
  }
}

/**
 * 更新維修訂單狀態
 */
export const updateRepairOrderStatus = (orders: RepairOrder[], orderId: string, status: RepairOrder['status']): void => {
  const order = orders.find(r => r.id === orderId)
  if (order) {
    order.status = status
    order.updatedAt = new Date().toISOString()
  }
}

/**
 * 添加使用者補充描述到維修訂單（獨立的補充記錄）
 */
export const addUserDescriptionToOrder = (
  orders: RepairOrder[],
  orderId: string,
  description: string,
  images?: string[]
): boolean => {
  const order = orders.find(r => r.id === orderId)
  if (!order) return false

  // 如果沒有描述也沒有圖片，返回 false
  if ((!description || !description.trim()) && (!images || images.length === 0)) {
    return false
  }

  // 建立新的補充記錄
  const supplement: RepairSupplement = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    content: description && description.trim() ? description.trim() : undefined,
    attachmentUrls: images && images.length > 0 ? images : undefined
  }

  // 初始化 supplements 陣列（如果不存在）
  if (!order.supplements) {
    order.supplements = []
  }

  // 添加補充記錄
  order.supplements.push(supplement)

  order.updatedAt = new Date().toISOString()
  return true
}
