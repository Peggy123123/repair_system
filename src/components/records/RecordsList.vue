<template>
  <!-- 首次載入狀態 -->
  <LoadingSpinner v-if="isInitialLoading" message="載入中..." />

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
      <h2 class="text-2xl font-bold text-textColor">{{ statusConfig.label }}</h2>
      <p class="mt-1 text-sm text-gray-600">共 {{ totalOrders }} 筆記錄</p>
    </div>

    <!-- 空狀態 -->
    <div v-if="orders.length === 0" class="text-center py-12">
      <h3 class="mt-2 text-sm font-medium text-gray-500">尚無{{ statusConfig.label }}記錄</h3>
    </div>

    <!-- 訂單列表 -->
    <div v-else class="space-y-4">
      <div
        v-for="order in orders"
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

              <span class="text-sm font-bold text-textColor">{{ order.category }}</span>
            </div>
            <span class="text-sm text-gray-500">
              {{ formatDate(order.createdAt) }}
            </span>
          </div>

          <div class="mb-4 flex flex-col gap-4">
            <h4 class="text-sm font-semibold text-textColor">
              <span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">主題</span>
              {{ order.title }}
            </h4>
            <h4 class="text-sm font-semibold text-textColor">
              <span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">描述</span>
              {{ getOriginalDescription(order.description) }}
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

      <!-- 載入更多觸發器 -->
      <div ref="loadMoreTrigger" class="py-4">
        <!-- 載入中狀態 -->
        <div v-if="isLoading" class="flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        <!-- 已載入全部 -->
        <div v-else-if="!hasMore" class="text-center text-sm text-gray-500">
          已顯示全部記錄
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMyOrders } from '@/services/api'
import { REPAIR_STATUS_CONFIG, type RepairOrder, type RepairStatus } from '@/types'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()

const status = computed(() => route.params.status as RepairStatus)

// 狀態管理
const orders = ref<RepairOrder[]>([])
const currentPage = ref(1)
const totalOrders = ref(0)
const hasMore = ref(true)
const isLoading = ref(false)
const isInitialLoading = ref(true)
const loadMoreTrigger = ref<HTMLElement | null>(null)

let observer: IntersectionObserver | null = null

// 驗證 status 是否為有效值
const isValidStatus = computed(() => {
  const validStatuses: RepairStatus[] = ['pending', 'in_progress', 'repairing', 'completed', 'cancelled']
  return validStatuses.includes(status.value)
})

const statusConfig = computed(() => {
  if (!isValidStatus.value) {
    return REPAIR_STATUS_CONFIG.pending // 預設值
  }
  return REPAIR_STATUS_CONFIG[status.value]
})

// 載入訂單
const loadOrders = async (isInitial = false) => {
  if (isLoading.value) return

  try {
    isLoading.value = true

    const result = await getMyOrders({
      status: status.value,
      page: currentPage.value,
      limit: 10
    })

    if (isInitial) {
      orders.value = result.items
    } else {
      orders.value.push(...result.items)
    }

    totalOrders.value = result.total
    hasMore.value = currentPage.value < result.totalPages
    currentPage.value++
  } catch (error) {
    console.error('載入訂單失敗:', error)
  } finally {
    isLoading.value = false
    if (isInitial) {
      isInitialLoading.value = false
    }
  }
}

// 設置 Intersection Observer
const setupObserver = () => {
  if (!loadMoreTrigger.value) return

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore.value && !isLoading.value) {
        loadOrders(false)
      }
    },
    {
      rootMargin: '100px',
      threshold: 0.1
    }
  )

  observer.observe(loadMoreTrigger.value)
}

// 清理 Observer
const cleanupObserver = () => {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

// 重置並重新載入
const resetAndLoad = async () => {
  cleanupObserver()
  orders.value = []
  currentPage.value = 1
  hasMore.value = true
  isInitialLoading.value = true

  await loadOrders(true)

  // 等待 DOM 更新後設置 Observer
  setTimeout(() => {
    setupObserver()
  }, 100)
}

// 監聽狀態變化
watch(status, () => {
  resetAndLoad()
})

onMounted(async () => {
  await loadOrders(true)

  // 確保 DOM 已渲染
  setTimeout(() => {
    setupObserver()
  }, 100)
})

onUnmounted(() => {
  cleanupObserver()
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
