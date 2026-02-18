import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RepairRequest, Reply, RepairStatus, RepairRequestWithUser } from '@/types'

export const useRepairRequestsStore = defineStore('repairRequests', () => {
  const requests = ref<RepairRequest[]>([])
  const adminRequests = ref<RepairRequestWithUser[]>([])
  const replies = ref<Reply[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getUserRequests = (userId: string) => {
    return requests.value.filter(r => r.userId === userId)
  }

  const getRequestReplies = (repairRequestId: string) => {
    return replies.value.filter(r => r.repairRequestId === repairRequestId)
  }

  const getRequestById = (requestId: string) => {
    return requests.value.find(r => r.id === requestId) ||
          adminRequests.value.find(r => r.id === requestId)
  }

  // 統計資訊
  const stats = computed(() => {
    const allRequests = adminRequests.value.length > 0 ? adminRequests.value : requests.value
    const statusCounts = {
      pending: 0,
      in_progress: 0,
      repairing: 0,
      completed: 0,
      cancelled: 0
    }
    allRequests.forEach(r => {
      if (statusCounts[r.status as RepairStatus] !== undefined) {
        statusCounts[r.status as RepairStatus]++
      }
    })
    return {
      total: allRequests.length,
      ...statusCounts
    }
  })

  // ─── State setters ───

  const setRequests = (list: RepairRequest[]) => {
    requests.value = list
  }

  const setAdminRequests = (list: RepairRequestWithUser[]) => {
    adminRequests.value = list
  }

  const upsertRequest = (item: RepairRequest) => {
    const idx = requests.value.findIndex(r => r.id === item.id)
    if (idx >= 0) {
      requests.value[idx] = item
    } else {
      requests.value.unshift(item)
    }
  }

  const removeRequest = (id: string) => {
    requests.value = requests.value.filter(r => r.id !== id)
    adminRequests.value = adminRequests.value.filter(r => r.id !== id)
  }

  const setReplies = (requestId: string, list: Reply[]) => {
    replies.value = replies.value.filter(r => r.repairRequestId !== requestId)
    replies.value.push(...list)
  }

  const addReply = (reply: Reply) => {
    replies.value.push(reply)
  }

  return {
    requests,
    adminRequests,
    replies,
    isLoading,
    error,
    // Getters
    getUserRequests,
    getRequestReplies,
    getRequestById,
    stats,
    // State setters
    setRequests,
    setAdminRequests,
    upsertRequest,
    removeRequest,
    setReplies,
    addReply
  }
})
