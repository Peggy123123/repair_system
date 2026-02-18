<template>
  <div>
    <!-- Loading 狀態 -->
    <LoadingSpinner v-if="loading" message="載入中..." />

    <template v-else>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">使用者管理</h2>
        <p class="mt-1 text-sm text-gray-600">管理系統使用者</p>
      </div>

      <!-- 搜尋和篩選 -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              搜尋使用者
            </label>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="搜尋姓名或ID..."
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>

      <!-- 使用者列表 -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">使用者列表</h3>
          </div>

          <div v-if="error" class="text-center py-8">
          <p class="text-red-500">{{ error }}</p>
        </div>

          <div v-else-if="filteredUsers.length === 0" class="text-center py-8">
            <p class="text-gray-500">沒有找到符合條件的使用者</p>
          </div>

          <div v-else class="space-y-3">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            @click="viewUserOrders(user)"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ user.displayName }}</h3>
                <p class="text-sm text-gray-500">ID: {{ user.id }}</p>
                <p class="text-sm text-gray-500">LINE ID: {{ user.lineUserId || '未綁定' }}</p>
                <p 
                  class="text-sm mt-1"
                  :class="getUserRepairCount(user.id) > 0 ? 'text-primary' : 'text-gray-400'"
                >
                  {{ getUserRepairCount(user.id) > 0 ? `已申請維修：${getUserRepairCount(user.id)}次` : '未申請過維修' }}
                </p>
              </div>
            </div>
            <div class="flex items-center">
              <font-awesome-icon icon="chevron-right" class="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiUser } from '@/types/api'
import { getUsers, getAllOrders } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()

const searchQuery = ref('')
const loading = ref(false)
const error = ref('')
const users = ref<ApiUser[]>([])
const repairCountMap = ref<Record<string, number>>({})

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const [usersData, orders] = await Promise.all([
      getUsers(),
      getAllOrders(),
    ])
    users.value = usersData
    // 建立每個使用者的維修申請次數 map
    const countMap: Record<string, number> = {}
    orders.forEach((order) => {
      countMap[order.userId] = (countMap[order.userId] || 0) + 1
    })
    repairCountMap.value = countMap
  } catch (e: any) {
    error.value = e?.message || '載入使用者列表失敗'
  } finally {
    loading.value = false
  }
})

const getUserRepairCount = (userId: string): number => {
  return repairCountMap.value[userId] || 0
}

const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u =>
      u.displayName.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query)
    )
  }

  return filtered
})

const viewUserOrders = (user: ApiUser) => {
  router.push(`/admin/users/${user.id}/orders`)
}
</script>
