import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RepairRequest, Reply, RepairStatus } from '@/types'
import { mockRequests, mockReplies } from '@/mock/repairRequests'
import { updateRepairRequestStatus as updateStatus } from '@/utils/repairRequestUtils'

export const useRepairRequestsStore = defineStore('repairRequests', () => {
  const requests = ref<RepairRequest[]>([...mockRequests])
  const replies = ref<Reply[]>([...mockReplies])

  // Getters
  const getUserRequests = (userId: string) => {
    return requests.value.filter(r => r.userId === userId)
  }

  const getRequestReplies = (repairRequestId: string) => {
    return replies.value.filter(r => r.repairRequestId === repairRequestId)
  }

  const getRequestById = (requestId: string) => {
    return requests.value.find(r => r.id === requestId)
  }

  // 統計資訊
  const stats = computed(() => {
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      repairing: 0,
      completed: 0,
      cancelled: 0
    }
    requests.value.forEach(r => {
      if (statusCounts[r.status as RepairStatus] !== undefined) {
        statusCounts[r.status as RepairStatus]++
      }
    })
    return {
      total: requests.value.length,
      ...statusCounts
    }
  })

  // Actions
  const addRequest = (request: RepairRequest) => {
    requests.value.unshift(request)
  }

  const addReply = (reply: Reply) => {
    replies.value.push(reply)
  }

  const updateRequestStatus = (requestId: string, status: RepairRequest['status']) => {
    updateStatus(requests.value, requestId, status)
  }

  return {
    requests,
    replies,
    // Getters
    getUserRequests,
    getRequestReplies,
    getRequestById,
    stats,
    // Actions
    addRequest,
    addReply,
    updateRequestStatus
  }
})
