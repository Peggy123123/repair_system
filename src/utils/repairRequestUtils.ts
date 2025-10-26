import type { RepairRequest, Reply } from '@/types'

/**
 * 生成新的維修申請
 */
export const createRepairRequest = (request: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt'>): RepairRequest => {
  return {
    ...request,
    id: Date.now().toString(),
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
    id: Date.now().toString(),
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
export const addUserDescriptionToRequest = (requests: RepairRequest[], requestId: string, description: string): void => {
  const request = requests.find(r => r.id === requestId)
  if (request) {
    request.description += `\n\n[使用者補充描述 - ${new Date().toLocaleString('zh-TW')}]\n${description}`
    request.updatedAt = new Date().toISOString()
  }
}
