import type { RepairRequest, Reply, RepairSupplement } from '@/types'

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
 * 生成新的維修申請
 */
export const createRepairRequest = (request: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt'>): RepairRequest => {
  return {
    ...request,
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
 * 更新維修申請狀態
 */
export const updateRepairRequestStatus = (requests: RepairRequest[], requestId: string, status: RepairRequest['status']): void => {
  const request = requests.find(r => r.id === requestId)
  if (request) {
    request.status = status
    request.updatedAt = new Date().toISOString()
  }
}

/**
 * 添加使用者補充描述到維修申請（獨立的補充記錄）
 */
export const addUserDescriptionToRequest = (
  requests: RepairRequest[],
  requestId: string,
  description: string,
  images?: string[]
): boolean => {
  const request = requests.find(r => r.id === requestId)
  if (!request) return false

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
  if (!request.supplements) {
    request.supplements = []
  }

  // 添加補充記錄
  request.supplements.push(supplement)

  request.updatedAt = new Date().toISOString()
  return true
}
