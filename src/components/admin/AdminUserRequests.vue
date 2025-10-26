<template>
  <div>
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

    <!-- 使用者資訊 -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <img
              :src="user?.avatarUrl || 'https://via.placeholder.com/40x40'"
              :alt="user?.displayName"
              class="h-12 w-12 rounded-full"
            />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900">{{ user?.displayName }}</h3>
            <p class="text-sm text-gray-500">ID: {{ user?.id }}</p>
            <p class="text-sm text-gray-500">LINE ID: {{ user?.lineUserId || '未綁定' }}</p>
            <p class="text-sm text-primary mt-1">
              總申請次數：{{ userRequests.length }} 次
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

        <div v-if="userRequests.length === 0" class="text-center py-8">
          <p class="text-gray-500">該使用者尚未申請過維修</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="request in userRequests"
            :key="request.id"
            @click="viewRequestDetail(request)"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <h4 class="text-sm font-medium text-gray-900">{{ request.title }}</h4>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getStatusClass(request.status)">
                  {{ getStatusText(request.status) }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-1">{{ request.description }}</p>
              <div class="flex items-center space-x-4 text-xs text-gray-500">
                <span>類別：{{ request.category }}</span>
                <span>申請時間：{{ formatDate(request.createdAt) }}</span>
                <span v-if="request.updatedAt !== request.createdAt">
                  更新時間：{{ formatDate(request.updatedAt) }}
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

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { AdminUser } from '@/types/admin'
import type { RepairRequest } from '@/types'
import { mockUsers } from '@/mock/users'
import { mockRequests } from '@/mock/repairRequests'

const route = useRoute()
const router = useRouter()

const userId = computed(() => route.params.userId as string)
const user = ref<AdminUser | undefined>()

const userRequests = computed(() => {
  return mockRequests.filter(request => request.userId === userId.value)
})

const getStatusClass = (status: string) => {
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const statusTexts = {
    pending: '待處理',
    in_progress: '處理中',
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

const viewRequestDetail = (request: RepairRequest) => {
  router.push(`/admin/orders/${request.id}`)
}

onMounted(() => {
  user.value = mockUsers.find(u => u.id === userId.value)
  if (!user.value) {
    router.push('/admin/users')
  }
})
</script>
