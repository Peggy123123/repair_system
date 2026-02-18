<template>
  <!-- Loading 狀態 -->
  <LoadingSpinner v-if="isLoading" message="載入中..." />

  <template v-else>
    <!-- 頁面標題 -->
    <div class="mb-6">
      <div class="flex items-center space-x-4 mb-4">
        <Button
          @click="$router.back()"
          text="返回"
          icon="arrow-left"
          variant="outline"
          size="sm"
          :full-width="false"
        />
      </div>
      <h2 class="text-2xl font-bold text-gray-900">{{ statusConfig.label }}</h2>
      <p class="mt-1 text-sm text-gray-600">共 {{ filteredOrders.length }} 筆記錄</p>
    </div>

    <!-- 空狀態 -->
    <div v-if="filteredOrders.length === 0" class="text-center py-12">
    <h3 class="mt-2 text-sm font-medium text-gray-500">尚無{{ statusConfig.label }}記錄</h3>
  </div>

  <!-- 請求列表 -->
  <div v-else class="space-y-4">
    <div
      v-for="order in filteredOrders"
      :key="order.id"
      class="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
      @click="navigateToDetail(order.id)"
    >
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="statusConfig.bgColor + ' ' + statusConfig.color"
            >
              {{ statusConfig.label }}
            </span>

            <span class="text-sm font-bold text-gray-900">{{ order.category }}</span>
          </div>
          <span class="text-sm text-gray-500">
            {{ formatDate(order.createdAt) }}
          </span>
        </div>

        <div class="mb-4 flex flex-col gap-4">
          <h4 class="text-sm font-semibold text-gray-900"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">主題</span> {{ order.title }}</h4>
          <h4 class="text-sm font-semibold text-gray-900"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">描述</span> {{ getOriginalDescription(order.description) }}
          </h4>
        </div>

        <div v-if="order.attachmentUrls && order.attachmentUrls.length > 0" class="mb-4">
          <div class="flex items-center text-sm text-gray-500">
            <font-awesome-icon icon="paperclip" class="mr-1" />
            包含附件圖片
          </div>
        </div>

        <!-- 點擊提示 -->
        <div class="mt-4 flex items-center justify-end text-sm text-gray-400">
          <span>點擊查看詳細</span>
          <font-awesome-icon icon="chevron-right" class="ml-1" />
        </div>
      </div>
    </div>
  </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMyOrders } from '@/services/api'
import { REPAIR_STATUS_CONFIG, type RepairOrder, type RepairStatus } from '@/types'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const status = route.params.status as RepairStatus

const allOrders = ref<RepairOrder[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    allOrders.value = await getMyOrders()
  } catch {
    // API 錯誤
  } finally {
    isLoading.value = false
  }
})

// 驗證 status 是否為有效值
const isValidStatus = computed(() => {
  const validStatuses: RepairStatus[] = ['pending', 'in_progress', 'repairing', 'completed', 'cancelled']
  return validStatuses.includes(status)
})

const statusConfig = computed(() => {
  if (!isValidStatus.value) {
    return REPAIR_STATUS_CONFIG.pending // 預設值
  }
  return REPAIR_STATUS_CONFIG[status]
})

const filteredOrders = computed(() => {
  return allOrders.value.filter(order => order.status === status)
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getOriginalDescription = (description: string) => {
  // 移除使用者補充描述部分
  const userDescriptionIndex = description.indexOf('\n\n[使用者補充描述 -')
  if (userDescriptionIndex !== -1) {
    return description.substring(0, userDescriptionIndex)
  }
  return description
}

const navigateToDetail = (orderId: string) => {
  router.push(`/my-orders/detail/${orderId}`)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
