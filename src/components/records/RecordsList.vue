<template>
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
    <p class="mt-1 text-sm text-gray-600">共 {{ filteredRequests.length }} 筆記錄</p>
  </div>

  <!-- 空狀態 -->
  <div v-if="filteredRequests.length === 0" class="text-center py-12">
    <h3 class="mt-2 text-sm font-medium text-gray-500">尚無{{ statusConfig.label }}記錄</h3>
  </div>

  <!-- 請求列表 -->
  <div v-else class="space-y-4">
    <div
      v-for="request in filteredRequests"
      :key="request.id"
      class="bg-white shadow rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
      @click="navigateToDetail(request.id)"
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

            <span class="text-sm font-bold text-gray-900">{{ request.category }}</span>
          </div>
          <span class="text-sm text-gray-500">
            {{ formatDate(request.createdAt) }}
          </span>
        </div>

        <div class="mb-4 flex flex-col gap-4">
          <h4 class="text-sm font-semibold text-gray-900"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">主題</span> {{ request.title }}</h4>
          <h4 class="text-sm font-semibold text-gray-900"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">描述</span> {{ getOriginalDescription(request.description) }}
          </h4>
        </div>

        <div v-if="request.attachmentUrl" class="mb-4">
          <div class="flex items-center text-sm text-gray-500">
            <font-awesome-icon icon="paperclip" class="mr-1" />
            包含附件圖片
          </div>
        </div>

        <!-- 回覆預覽 -->
        <div v-if="requestReplies[request.id]?.length > 0" class="mt-4 pt-4 border-t border-gray-200">
          <div class="flex items-center text-sm text-gray-500 mb-2">
            <font-awesome-icon icon="comment" class="mr-1" />
            管理員回覆 ({{ requestReplies[request.id].length }})
          </div>
          <p class="text-sm text-gray-600 line-clamp-1">
            {{ requestReplies[request.id][0].content }}
          </p>
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

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import { useUserStore } from '@/stores/user'
import { REPAIR_STATUS_CONFIG, type RepairStatus } from '@/types'
import Button from '@/components/common/Button.vue'

const route = useRoute()
const router = useRouter()
const repairRequestsStore = useRepairRequestsStore()
const userStore = useUserStore()

const status = route.params.status as RepairStatus

const statusConfig = computed(() => REPAIR_STATUS_CONFIG[status])

const userRequests = computed(() => {
  if (!userStore.currentUser) return []
  return repairRequestsStore.getUserRequests(userStore.currentUser.id)
})

const filteredRequests = computed(() => {
  return userRequests.value.filter(request => request.status === status)
})

const requestReplies = computed(() => {
  const replies: Record<string, any[]> = {}
  filteredRequests.value.forEach(request => {
    replies[request.id] = repairRequestsStore.getRequestReplies(request.id)
  })
  return replies
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

const navigateToDetail = (requestId: string) => {
  router.push(`/my-requests/detail/${requestId}`)
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
