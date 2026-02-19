<template>
  <div>
    <!-- Loading 狀態 -->
    <LoadingSpinner v-if="loading" message="載入中..." />

    <template v-else>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-textColor">使用者管理</h2>
        <p class="mt-1 text-sm text-gray-600">管理系統使用者</p>
      </div>

      <!-- 搜尋和篩選 -->
      <UsersFilterBar
        v-model="filters"
        @search="handleFilterSearch"
      />

      <!-- 使用者列表 -->
      <div class="bg-white shadow rounded-lg overflow-hidden mt-6">
        <div v-if="error" class="px-4 py-8 text-center">
          <p class="text-red-500">{{ error }}</p>
        </div>

        <div v-else-if="users.length === 0" class="px-4 py-8 text-center">
          <p class="text-gray-500">沒有找到符合條件的使用者</p>
        </div>

        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                使用者
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                LINE ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                成為會員
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
                @click="toggleSort('points')"
              >
                <div class="flex items-center gap-2">
                  <span>點數</span>
                  <font-awesome-icon
                    v-if="sortBy === 'points'"
                    :icon="sortOrder === 'desc' ? 'sort-down' : 'sort-up'"
                    class="text-primary"
                  />
                  <font-awesome-icon
                    v-else
                    icon="sort"
                    class="text-gray-400"
                  />
                </div>
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
                @click="toggleSort('orderCount')"
              >
                <div class="flex items-center gap-2">
                  <span>申請次數</span>
                  <font-awesome-icon
                    v-if="sortBy === 'orderCount'"
                    :icon="sortOrder === 'desc' ? 'sort-down' : 'sort-up'"
                    class="text-primary"
                  />
                  <font-awesome-icon
                    v-else
                    icon="sort"
                    class="text-gray-400"
                  />
                </div>
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">查看</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
              @click="viewUserOrders(user)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img
                      v-if="user.avatarUrl && user.avatarUrl !== '' && !avatarErrors[user.id]"
                      :src="user.avatarUrl"
                      :alt="user.displayName"
                      class="h-10 w-10 rounded-full object-cover"
                      @error="handleAvatarError(user.id)"
                    />
                    <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <font-awesome-icon icon="user" class="text-gray-400 text-lg" />
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-textColor">{{ user.displayName }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ user.lineUserId || '未綁定' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.memberSince) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                {{ user.points }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm"
                  :class="getUserRepairCount(user.id) > 0 ? 'text-primary font-medium' : 'text-gray-400'">
                {{ getUserRepairCount(user.id) }} 次
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <font-awesome-icon icon="chevron-right" class="h-4 w-4 text-gray-400" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <div class="mt-4">
        <Pagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @page-change="handlePageChange"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { ApiUser } from '@/types/api'
import { getUsers, getAllOrders } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Pagination from '@/components/common/Pagination.vue'
import UsersFilterBar from '@/components/admin/shared/UsersFilterBar.vue'

const router = useRouter()

const loading = ref(false)
const error = ref('')
const users = ref<ApiUser[]>([])
const repairCountMap = ref<Record<string, number>>({})
const avatarErrors = ref<Record<string, boolean>>({})
const currentPage = ref(1)
const totalPages = ref(0)
const pageSize = 10

// 篩選參數
const filters = ref({
  keyword: '',
  startDate: '',
  endDate: ''
})

// 排序參數
const sortBy = ref<string>('')
const sortOrder = ref<'asc' | 'desc'>('desc')

const loadUsers = async () => {
  loading.value = true
  error.value = ''
  try {
    const [usersResult, ordersResult] = await Promise.all([
      getUsers({
        page: currentPage.value,
        limit: pageSize,
        keyword: filters.value.keyword || undefined,
        startDate: filters.value.startDate || undefined,
        endDate: filters.value.endDate || undefined,
        sortBy: sortBy.value || undefined,
        sortOrder: sortOrder.value
      }),
      getAllOrders({ limit: 9999 }), // 仍需要獲取所有訂單來計算申請次數（用於顯示）
    ])
    users.value = usersResult.items
    totalPages.value = usersResult.totalPages

    // 建立每個使用者的維修申請次數 map（用於顯示）
    const countMap: Record<string, number> = {}
    ordersResult.items.forEach((order) => {
      countMap[order.userId] = (countMap[order.userId] || 0) + 1
    })
    repairCountMap.value = countMap
  } catch (e: any) {
    error.value = e?.message || '載入使用者列表失敗'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

const getUserRepairCount = (userId: string): number => {
  return repairCountMap.value[userId] || 0
}

const handleFilterSearch = () => {
  currentPage.value = 1 // 重置到第一頁
  loadUsers()
}

const toggleSort = (field: 'points' | 'orderCount') => {
  if (sortBy.value === field) {
    // 同一個欄位：desc -> asc -> 取消排序
    if (sortOrder.value === 'desc') {
      sortOrder.value = 'asc'
    } else {
      // 取消排序
      sortBy.value = ''
      sortOrder.value = 'desc'
    }
  } else {
    // 新欄位：設為降序
    sortBy.value = field
    sortOrder.value = 'desc'
  }
  currentPage.value = 1 // 重置到第一頁
  loadUsers()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUsers()
}

const viewUserOrders = (user: ApiUser) => {
  router.push(`/admin/users/${user.id}/orders`)
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const handleAvatarError = (userId: string) => {
  avatarErrors.value[userId] = true
}
</script>
