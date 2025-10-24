import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RepairRequest, Reply } from '@/types'

export const useRepairRequestsStore = defineStore('repairRequests', () => {
  const requests = ref<RepairRequest[]>([])
  const replies = ref<Reply[]>([])

  // Mock 資料
  const mockRequests: RepairRequest[] = [
    {
      id: '1',
      userId: 'user1',
      category: '硬體故障',
      title: '電腦無法開機',
      description: '按下電源鍵沒有反應，風扇也不轉動',
      attachmentUrl: 'https://via.placeholder.com/300x200',
      status: 'pending',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      userId: 'user1',
      category: '軟體問題',
      title: 'Windows 藍屏錯誤',
      description: 'Windows 更新後出現藍屏錯誤，錯誤代碼 0x0000007B',
      status: 'in_progress',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T16:45:00Z'
    },
    {
      id: '3',
      userId: 'user1',
      category: '系統重灌',
      title: 'Windows 11 重灌',
      description: '需要重灌 Windows 11，保留重要資料，包括文件、照片等',
      status: 'completed',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T15:30:00Z'
    },
    {
      id: '4',
      userId: 'user1',
      category: '網路問題',
      title: '網路連線不穩定',
      description: '網路連線不穩定，經常斷線，影響工作',
      status: 'cancelled',
      createdAt: '2024-01-12T11:00:00Z',
      updatedAt: '2024-01-12T14:20:00Z'
    },
    {
      id: '5',
      userId: 'user1',
      category: '資料救援',
      title: '硬碟資料救援',
      description: '硬碟損壞，需要救援重要檔案，包括工作文件和個人照片',
      status: 'pending',
      createdAt: '2024-01-11T16:45:00Z',
      updatedAt: '2024-01-11T16:45:00Z'
    }
  ]

  const mockReplies: Reply[] = [
    {
      id: '1',
      repairRequestId: '2',
      adminId: 'admin1',
      content: '建議您先嘗試進入安全模式，如果問題持續，我們可以安排現場檢測。',
      createdAt: '2024-01-14T16:45:00Z'
    },
    {
      id: '2',
      repairRequestId: '3',
      adminId: 'admin1',
      content: '系統重灌已完成，所有重要資料已備份並恢復。請測試系統功能是否正常。',
      createdAt: '2024-01-13T15:30:00Z'
    }
  ]

  // 初始化 mock 資料
  requests.value = mockRequests
  replies.value = mockReplies

  const addRequest = (request: Omit<RepairRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRequest: RepairRequest = {
      ...request,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    requests.value.unshift(newRequest)
    return newRequest
  }

  const addReply = (reply: Omit<Reply, 'id' | 'createdAt'>) => {
    const newReply: Reply = {
      ...reply,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    replies.value.push(newReply)
    
    // 更新對應維修單狀態
    const request = requests.value.find(r => r.id === reply.repairRequestId)
    if (request) {
      request.status = 'in_progress'
      request.updatedAt = new Date().toISOString()
    }
    
    return newReply
  }

  const getUserRequests = (userId: string) => {
    return requests.value.filter(r => r.userId === userId)
  }

  const getRequestReplies = (repairRequestId: string) => {
    return replies.value.filter(r => r.repairRequestId === repairRequestId)
  }

  const updateRequestStatus = (requestId: string, status: RepairRequest['status']) => {
    const request = requests.value.find(r => r.id === requestId)
    if (request) {
      request.status = status
      request.updatedAt = new Date().toISOString()
    }
  }

  const addUserDescription = (requestId: string, description: string) => {
    const request = requests.value.find(r => r.id === requestId)
    if (request) {
      // 將使用者描述添加到現有描述中
      request.description += `\n\n[使用者補充描述 - ${new Date().toLocaleString('zh-TW')}]\n${description}`
      request.updatedAt = new Date().toISOString()
    }
  }

  return {
    requests,
    replies,
    addRequest,
    addReply,
    getUserRequests,
    getRequestReplies,
    updateRequestStatus,
    addUserDescription
  }
})
