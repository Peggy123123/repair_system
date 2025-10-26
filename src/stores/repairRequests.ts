import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RepairRequest, Reply } from '@/types'
import { mockRequests, mockReplies } from '@/mock/repairRequests'
import { updateRepairRequestStatus } from '@/utils/repairRequestUtils'

export const useRepairRequestsStore = defineStore('repairRequests', () => {
  const requests = ref<RepairRequest[]>([])
  const replies = ref<Reply[]>([])

  // 初始化 mock 資料
  requests.value = mockRequests
  replies.value = mockReplies


  const getUserRequests = (userId: string) => {
    return requests.value.filter(r => r.userId === userId)
  }

  const getRequestReplies = (repairRequestId: string) => {
    return replies.value.filter(r => r.repairRequestId === repairRequestId)
  }

  const updateRequestStatus = (requestId: string, status: RepairRequest['status']) => {
    updateRepairRequestStatus(requests.value, requestId, status)
  }


  return {
    requests,
    replies,
    getUserRequests,
    getRequestReplies,
    updateRequestStatus
  }
})
