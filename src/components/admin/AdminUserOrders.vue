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
            <h2 class="text-2xl font-bold text-gray-900">{{ user?.displayName }} 的申請記錄</h2>
          </div>
        </div>
      </div>

      <div v-if="error" class="text-center py-8">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <div v-else>
        <!-- 使用者資訊 -->
        <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div v-if="user?.avatarUrl && user?.avatarUrl !== ''">
                <img
                  :src="user?.avatarUrl"
                  :alt="user?.displayName"
                  class="h-12 w-12 rounded-full object-cover"
                />
              </div>
              <div v-else class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                <font-awesome-icon icon="user" class="text-gray-400 text-2xl" />
              </div>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ user?.displayName }}</h3>
              <p class="text-sm text-gray-500">ID: {{ user?.id }}</p>
              <p class="text-sm text-gray-500">LINE ID: {{ user?.lineUserId || '未綁定' }}</p>
              <p class="text-sm text-primary mt-1">
                總申請次數：{{ userOrders.length }} 次
              </p>
            </div>
            </div>
          </div>
        </div>

        <!-- 申請列表 -->
        <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">申請記錄</h3>
          </div>

            <div v-if="userOrders.length === 0" class="text-center py-8">
              <p class="text-gray-500">該使用者尚未申請過維修</p>
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="order in userOrders"
                :key="order.id"
                @click="viewOrderDetail(order)"
                class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div class="flex-1">
                  <div class="flex items-center space-x-3 mb-2">
                    <h4 class="text-sm font-medium text-gray-900">{{ order.title }}</h4>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          :class="getStatusClass(order.status)">
                      {{ getStatusText(order.status) }}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-1">{{ order.description }}</p>
                  <div class="flex items-center space-x-4 text-xs text-gray-500">
                    <span>類別：{{ order.category }}</span>
                    <span>機型：{{ getDeviceTypeName(order.deviceType) }}</span>
                    <span>申請時間：{{ formatDate(order.createdAt) }}</span>
                    <span v-if="order.updatedAt !== order.createdAt">
                      更新時間：{{ formatDate(order.updatedAt) }}
                    </span>
                  </div>
                </div>
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
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { ApiUser } from '@/types/api'
import type { RepairOrder } from '@/types'
import { DEVICE_TYPES } from '@/types'
import { getUserOrders } from '@/services/api'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const userId = route.params.userId as string
const user = ref<ApiUser | undefined>()
const userOrders = ref<RepairOrder[]>([])
const loading = ref(false)
const error = ref('')

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

const getDeviceTypeName = (deviceTypeId: string) => {
  const deviceType = DEVICE_TYPES.find(dt => dt.id === deviceTypeId)
  return deviceType ? deviceType.name : deviceTypeId
}

const viewOrderDetail = (order: RepairOrder) => {
  router.push(`/admin/orders/${order.id}`)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const result = await getUserOrders(userId)
    user.value = result.user
    userOrders.value = result.orders
  } catch (e: any) {
    error.value = e?.message || '載入使用者資料失敗'
  } finally {
    loading.value = false
  }
})
</script>
