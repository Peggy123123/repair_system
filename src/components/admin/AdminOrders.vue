<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">訂單管理</h2>
      <p class="mt-1 text-sm text-gray-600">管理所有維修申請訂單</p>
    </div>

    <!-- 篩選器 -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">
              狀態篩選
            </label>
            <select
              id="status-filter"
              v-model="selectedStatus"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">全部狀態</option>
              <option value="pending">待處理</option>
              <option value="in_progress">處理中</option>
              <option value="repairing">維修中</option>
              <option value="completed">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              搜尋
            </label>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="搜尋標題或類別..."
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 訂單列表 -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div v-if="filteredRequests.length === 0" class="text-center py-8">
          <p class="text-gray-500">沒有找到符合條件的訂單</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="request in filteredRequests"
            :key="request.id"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
            @click="goToDetail(request.id)"
          >
            <div class="flex items-center space-x-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getStatusClass(request.status)">
                {{ getStatusLabel(request.status) }}
              </span>
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ request.title }}</h3>
                <p class="text-sm text-gray-500">{{ request.category }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-gray-900">{{ formatDate(request.createdAt) }}</p>
              <p class="text-xs text-gray-500">申請人: {{ getUserName(request.userId) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import { REPAIR_STATUS_CONFIG } from '@/types'

const router = useRouter()
const repairRequestsStore = useRepairRequestsStore()

const selectedStatus = ref('')
const searchQuery = ref('')

const allRequests = computed(() => repairRequestsStore.requests)

const filteredRequests = computed(() => {
  let filtered = allRequests.value

  // 狀態篩選
  if (selectedStatus.value) {
    filtered = filtered.filter(r => r.status === selectedStatus.value)
  }

  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.category.toLowerCase().includes(query)
    )
  }

  // 按建立時間排序（最新的在前）
  return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
})

const getStatusClass = (status: string) => {
  const config = REPAIR_STATUS_CONFIG[status as keyof typeof REPAIR_STATUS_CONFIG]
  return config ? `${config.bgColor} ${config.color}` : 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const config = REPAIR_STATUS_CONFIG[status as keyof typeof REPAIR_STATUS_CONFIG]
  return config ? config.label : status
}

const getUserName = (userId: string) => {
  const userNames: Record<string, string> = {
    'user1': '測試使用者',
    'user2': '張小明',
    'user3': '李美華'
  }
  return userNames[userId] || '未知使用者'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goToDetail = (requestId: string) => {
  router.push(`/admin/orders/${requestId}`)
}
</script>
