import type { RepairRequest, Reply } from '@/types'

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
 * 添加使用者描述到維修申請
 */
export const addUserDescriptionToRequest = (requests: RepairRequest[], requestId: string, description: string): boolean => {
  if (!description || !description.trim()) {
    return false
  }

  const request = requests.find(r => r.id === requestId)
  if (request) {
    const currentDescription = request.description || ''
    request.description = `${currentDescription}\n\n[使用者補充描述 - ${new Date().toISOString()}]\n${description.trim()}`
    request.updatedAt = new Date().toISOString()
    return true
  }
  return false
}
