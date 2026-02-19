<template>
  <div>
    <!-- Loading 狀態 -->
    <LoadingSpinner v-if="loading" message="載入中..." />

    <template v-else>
      <div class="flex flex-col items-start gap-6">
          <Button
            @click="$router.back()"
            text="返回"
            icon="arrow-left"
            variant="text"
            size="sm"
            :full-width="false"
          />
        <div class="flex flex-col items-start space-x-4 mb-4">
          <div>
            <h2 class="text-2xl font-bold text-secondary">{{ user?.displayName }} 的申請記錄</h2>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-center py-8">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <div v-else>
        <!-- 使用者資訊 -->
        <div class="bg-white shadow rounded-lg mb-6">
          <div class="px-6 py-6">
            <div class="flex items-center gap-6">
              <div class="flex-shrink-0">
                <img
                  v-if="user?.avatarUrl && user?.avatarUrl !== '' && !avatarError"
                  :src="user?.avatarUrl"
                  :alt="user?.displayName"
                  @error="handleAvatarError"
                  class="h-20 w-20 rounded-full object-cover"
                />
                <div v-else class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  <font-awesome-icon icon="user" class="text-gray-400 text-3xl" />
                </div>
              </div>
              <div class="flex-1 flex items-center gap-8">
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">姓名</p>
                  <p class="text-sm text-secondary">{{ user?.displayName }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">ID</p>
                  <p class="text-sm text-secondary">{{ user?.id }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">LINE ID</p>
                  <p class="text-sm text-secondary">{{ user?.lineUserId || '未綁定' }}</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">成為會員時間</p>
                  <p class="text-sm text-secondary">{{ user?.memberSince ? formatMemberDate(user.memberSince) : '未知' }}</p>
                </div>
                <div class="flex items-end gap-3">
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">點數</p>
                    <p class="text-sm font-medium text-orange-600">{{ user?.points ?? 0 }}</p>
                  </div>
                  <button
                    @click="openEditDialog"
                    class="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-red-700 transition-colors"
                  >
                    編輯
                  </button>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">總申請次數</p>
                  <p class="text-sm text-primary">{{ totalOrders }} 次</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 篩選器 -->
        <OrdersFilterBar v-model="filters" @search="handleSearch" />

        <!-- 申請列表 -->
        <div class="bg-white shadow rounded-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg leading-6 font-medium text-secondary">申請記錄</h3>
          </div>

          <div v-if="userOrders.length === 0" class="px-4 py-8 text-center">
            <p class="text-gray-500">該使用者尚未申請過維修</p>
          </div>

          <table v-else class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  標題
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  類別
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  機型
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  申請時間
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新時間
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  回覆次數
                </th>
                <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  已印工單
                </th>
                <th scope="col" class="relative px-6 py-3">
                  <span class="sr-only">查看</span>
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="order in userOrders"
                :key="order.id"
                @click="viewOrderDetail(order)"
                class="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        :class="getStatusClass(order.status)">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-secondary max-w-[130px] truncate" :title="order.title">
                    {{ order.title }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ order.category }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ getDeviceTypeName(order.deviceType) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.updatedAt) }}
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
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
      </div>

      <!-- 編輯點數對話框 -->
      <div
        v-if="editingPoints"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeEditDialog"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 class="text-lg font-medium text-secondary mb-4">編輯使用者點數</h3>

          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">使用者：{{ user?.displayName }}</p>
            <label for="points" class="block text-sm font-medium text-gray-700 mb-1">
              點數
            </label>
            <input
              id="points"
              v-model.number="editPoints"
              type="number"
              min="0"
              step="1"
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              @keypress="validateInteger"
            />
            <p class="text-xs text-gray-500 mt-1">目前點數：{{ user?.points ?? 0 }}</p>
          </div>

          <div v-if="editError" class="mb-4">
            <p class="text-sm text-red-600">{{ editError }}</p>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeEditDialog"
              :disabled="saving"
              class="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              取消
            </button>
            <button
              @click="savePoints"
              :disabled="saving || editPoints < 0"
              class="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ saving ? '儲存中...' : '儲存' }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiUser } from '@/types/api'
import type { RepairOrder } from '@/types'
import { DEVICE_TYPES } from '@/types'
import { getUserOrders, updateUser } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Pagination from '@/components/common/Pagination.vue'
import OrdersFilterBar from '@/components/admin/shared/OrdersFilterBar.vue'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId as string
const user = ref<ApiUser | undefined>()
const userOrders = ref<RepairOrder[]>([])
const loading = ref(false)
const error = ref('')
const editingPoints = ref(false)
const editPoints = ref(0)
const saving = ref(false)
const editError = ref('')
const avatarError = ref(false)
const currentPage = ref(1)
const totalPages = ref(0)
const totalOrders = ref(0)
const pageSize = 10

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatMemberDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getDeviceTypeName = (deviceTypeId: string) => {
  const deviceType = DEVICE_TYPES.find(dt => dt.id === deviceTypeId)
  return deviceType ? deviceType.name : deviceTypeId
}

const viewOrderDetail = (order: RepairOrder) => {
  router.push(`/admin/orders/${order.id}`)
}

const handleAvatarError = () => {
  avatarError.value = true
}

const openEditDialog = () => {
  editingPoints.value = true
  editPoints.value = user.value?.points ?? 0
  editError.value = ''
}

const closeEditDialog = () => {
  editingPoints.value = false
  editPoints.value = 0
  editError.value = ''
}

const validateInteger = (event: KeyboardEvent) => {
  // 只允許數字
  if (!/[0-9]/.test(event.key)) {
    event.preventDefault()
  }
}

const savePoints = async () => {
  if (!user.value) return

  // 驗證點數必須是非負整數
  if (editPoints.value < 0 || !Number.isInteger(editPoints.value)) {
    editError.value = '點數必須是非負整數'
    return
  }

  saving.value = true
  editError.value = ''

  try {
    const updatedUser = await updateUser(user.value.id, {
      points: editPoints.value,
    })

    // 更新本地使用者資料
    user.value = updatedUser

    closeEditDialog()
  } catch (e: any) {
    editError.value = e?.message || '更新點數失敗'
  } finally {
    saving.value = false
  }
}

const loadUserOrders = async () => {
  loading.value = true
  error.value = ''
  try {
    const result = await getUserOrders(userId, {
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
    user.value = result.user
    userOrders.value = result.orders.items
    totalPages.value = result.orders.totalPages
    totalOrders.value = result.orders.total
  } catch (e: any) {
    error.value = e?.message || '載入使用者資料失敗'
  } finally {
    loading.value = false
  }
}

// 點擊搜尋按鈕
const handleSearch = () => {
  currentPage.value = 1
  loadUserOrders()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadUserOrders()
}

onMounted(() => {
  loadUserOrders()
})
</script>
