<template>
  <!-- Loading 狀態 -->
  <LoadingSpinner v-if="isLoading" message="載入中..." />

  <template v-else>
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-900">維修紀錄</h2>
      <p class="mt-1 text-sm text-gray-600">查看您的維修申請狀態與回覆</p>
    </div>

    <!-- 狀態分類卡片 -->
    <div class="space-y-4 mb-4">
    <StatusCard
      v-for="statusConfig in statusCards"
      :key="statusConfig.id"
      :status="statusConfig.id"
      :count="statusConfig.count"
      @click="navigateToStatusList(statusConfig.id)"
    />
  </div>

    <!-- 快速新增申請按鈕 -->
    <div class="flex justify-center md:justify-end">
      <Button
        variant="primary"
        text="新增維修申請"
        icon="plus"
        @click="router.push('/form')"
        :custom-class="'w-full md:w-fit'"
      />
    </div>
  </template>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyOrders } from '@/services/api'
import StatusCard from '@/components/common/StatusCard.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { REPAIR_STATUS_CONFIG, type RepairOrder, type RepairStatus, type RepairStatusConfig } from '@/types'

const router = useRouter()

const userOrders = ref<RepairOrder[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    userOrders.value = await getMyOrders()
  } catch {
    // API 錯誤
  } finally {
    isLoading.value = false
  }
})

const statusCards = computed((): RepairStatusConfig[] => {
  const statusCounts: Record<RepairStatus, number> = {
    pending: 0,
    in_progress: 0,
    repairing: 0,
    completed: 0,
    cancelled: 0
  }

  // 計算各狀態的數量
  userOrders.value.forEach(order => {
    statusCounts[order.status]++
  })

  // 轉換為卡片配置
  return Object.entries(REPAIR_STATUS_CONFIG).map(([status, config]) => ({
    ...config,
    count: statusCounts[status as RepairStatus]
  }))
})

const navigateToStatusList = (status: RepairStatus) => {
  router.push(`/my-orders/${status}`)
}
</script>
