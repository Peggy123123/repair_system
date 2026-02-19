<template>
  <div>
    <!-- Loading 狀態 -->
    <LoadingSpinner v-if="isLoading" message="載入中..." />

    <template v-else>
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-textColor">訂單管理</h2>
        <p class="mt-1 text-sm text-gray-600">管理所有維修申請訂單</p>
      </div>

      <!-- 篩選器 -->
      <OrdersFilterBar v-model="filters" @search="handleSearch" />

      <!-- 訂單表格 -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg leading-6">訂單列表</h3>
        </div>

        <div v-if="allOrders.length === 0" class="px-4 py-8 text-center">
          <p class="text-gray-500">沒有找到符合條件的訂單</p>
        </div>

        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                狀態
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                標題
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                類別
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                機型
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                使用者
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                申請時間
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">
                回覆次數
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs text-gray-500 uppercase tracking-wider">
                已印工單
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">查看</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="order in allOrders"
              :key="order.id"
              @click="goToDetail(order.id)"
              class="hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs"
                      :class="getStatusClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm max-w-[130px] truncate" :title="order.title">
                  {{ order.title }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ order.category }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ getDeviceTypeName(order.deviceType) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-8 w-8">
                    <img
                      v-if="order.userAvatar"
                      :src="order.userAvatar"
                      :alt="order.userName"
                      class="h-8 w-8 rounded-full object-cover"
                      @error="handleImageError"
                    />
                    <div v-else class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <font-awesome-icon icon="user" class="text-gray-400 text-sm" />
                    </div>
                  </div>
                  <div class="ml-3">
                    <div class="text-sm">{{ order.userName || '未知使用者' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                {{ order.replyCount || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <font-awesome-icon
                  v-if="order.isPrinted"
                  icon="check"
                  class="h-4 w-4 text-green-600"
                />
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                <font-awesome-icon icon="chevron-right" class="h-4 w-4 text-gray-400" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁 -->
      <Pagination
        :current-page="currentPage"
        :total-pages="totalPages"
        @page-change="handlePageChange"
        class="mt-4"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllOrders } from '@/services/api'
import type { RepairOrderWithUser } from '@/types'
import { DEVICE_TYPES } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Pagination from '@/components/common/Pagination.vue'
import OrdersFilterBar from '@/components/admin/shared/OrdersFilterBar.vue'

const router = useRouter()

// 篩選條件
const filters = ref({
  keyword: '',
  status: '',
  deviceType: '',
  category: '',
  startDate: '',
  endDate: '',
  isPrinted: false
})

const currentPage = ref(1)
const totalPages = ref(0)
const pageSize = 10

const allOrders = ref<RepairOrderWithUser[]>([])
const isLoading = ref(true)

const loadOrders = async () => {
  try {
    isLoading.value = true
    const result = await getAllOrders({
      keyword: filters.value.keyword || undefined,
      status: filters.value.status || undefined,
      deviceType: filters.value.deviceType || undefined,
      category: filters.value.category || undefined,
      startDate: filters.value.startDate || undefined,
      endDate: filters.value.endDate || undefined,
      isPrinted: filters.value.isPrinted ? true : undefined,
      page: currentPage.value,
      limit: pageSize
    })
    allOrders.value = result.items
    totalPages.value = result.totalPages
  } catch {
    // API 錯誤
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

// 點擊搜尋按鈕
const handleSearch = () => {
  currentPage.value = 1
  loadOrders()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadOrders()
}

const goToDetail = (orderId: string) => {
  router.push(`/admin/orders/${orderId}`)
}

// 狀態樣式
const getStatusClass = (status: string) => {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    repairing: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
}

// 狀態文字
const getStatusText = (status: string) => {
  const statusTexts = {
    pending: '待處理',
    in_progress: '處理中',
    repairing: '維修中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusTexts[status as keyof typeof statusTexts] || status
}

// 日期格式化
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// 設備類型名稱
const getDeviceTypeName = (deviceTypeId: string) => {
  const deviceType = DEVICE_TYPES.find(dt => dt.id === deviceTypeId)
  return deviceType ? deviceType.name : deviceTypeId
}

// 頭像載入失敗處理
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  // 使用灰色圓形作為預設頭像 (SVG data URL)
  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Ccircle cx="16" cy="16" r="16" fill="%23e5e7eb"/%3E%3Cpath d="M16 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 10c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z" fill="%239ca3af"/%3E%3C/svg%3E'
  // 移除 error 事件監聽，避免無限循環
  target.onerror = null
}
</script>
