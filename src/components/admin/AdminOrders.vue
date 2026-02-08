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
          <RepairOrderCard
            v-for="request in filteredRequests"
            :key="request.id"
            :request="request"
            variant="detailed"
            @click="goToDetail"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import RepairOrderCard from '@/components/admin/shared/RepairOrderCard.vue'

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

const goToDetail = (requestId: string) => {
  router.push(`/admin/orders/${requestId}`)
}
</script>
