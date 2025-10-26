<template>
  <div>
    <!-- 返回按鈕 -->
    <div class="mb-6">
      <button
        @click="goBack"
        class="flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <font-awesome-icon icon="arrow-left" class="mr-2 h-4 w-4" />
        返回訂單列表
      </button>
    </div>

    <div v-if="!request" class="text-center py-8">
      <p class="text-gray-500">找不到指定的訂單</p>
    </div>

    <div v-else>
      <!-- 訂單標題 -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">{{ request.title }}</h2>
        <p class="mt-1 text-sm text-gray-600">訂單編號: {{ request.id }}</p>
      </div>

      <!-- 訂單資訊 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 主要資訊 -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">訂單詳情</h3>
              
              <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt class="text-sm font-medium text-gray-500">申請人</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ getUserName(request.userId) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">類別</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ request.category }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">申請時間</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(request.createdAt) }}</dd>
                </div>
                <div>
                  <dt class="text-sm font-medium text-gray-500">最後更新</dt>
                  <dd class="mt-1 text-sm text-gray-900">{{ formatDate(request.updatedAt) }}</dd>
                </div>
              </dl>

              <div class="mt-6">
                <dt class="text-sm font-medium text-gray-500 mb-2">問題描述</dt>
                <dd class="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                  {{ request.description }}
                </dd>
              </div>

              <div v-if="request.attachmentUrl" class="mt-6">
                <dt class="text-sm font-medium text-gray-500 mb-2">附件圖片</dt>
                <div class="mt-2">
                  <img :src="request.attachmentUrl" alt="附件圖片" class="h-32 w-32 object-cover rounded-md">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 側邊欄 -->
        <div class="space-y-6">
          <!-- 狀態管理 -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">狀態</h3>
                <Button
                  @click="openStatusModal"
                  text="編輯狀態"
                  icon="edit"
                  variant="primary"
                  size="sm"
                  :full-width="false"
                />
              </div>
              
              <!-- 目前狀態顯示 -->
              <span 
                class="inline-flex items-center px-4 py-2 rounded-lg font-medium"
                :class="getStatusClass(request.status)"
              >
                {{ getStatusLabel(request.status) }}
              </span>
            </div>
          </div>

          <!-- 快速操作 -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">快速操作</h3>
              
              <div class="space-y-3">
                <button
                  @click="showReplyForm = !showReplyForm"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <font-awesome-icon icon="reply" class="mr-2" />
                  回覆申請
                </button>
                <button
                  @click="printWorkOrder"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <font-awesome-icon icon="print" class="mr-2" />
                  列印工單
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 回覆記錄 -->
      <div v-if="requestReplies.length > 0" class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">回覆記錄</h3>
          
          <div class="space-y-4">
            <div
              v-for="reply in requestReplies"
              :key="reply.id"
              class="border-l-4 border-blue-400 pl-4 py-2"
            >
              <div class="flex justify-between mb-2">
                <span class="text-sm font-medium text-gray-900">管理員</span>
                <span class="text-sm text-gray-500">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="text-sm text-gray-700">{{ reply.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 回覆表單 -->
      <div v-if="showReplyForm" class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">新增回覆</h3>
          
          <form @submit.prevent="submitReply" class="space-y-4">
            <div>
              <label for="reply-content" class="block text-sm font-medium text-gray-700 mb-1">
                回覆內容
              </label>
              <textarea
                id="reply-content"
                v-model="replyContent"
                required
                rows="4"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入回覆內容..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="showReplyForm = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmitting ? '回覆中...' : '提交回覆' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 狀態編輯彈窗 -->
    <StatusEditModal
      :is-open="showStatusModal"
      :current-status="request?.status || 'pending'"
      @close="closeStatusModal"
      @status-change="handleStatusChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import { useAdminStore } from '@/stores/admin'
import { REPAIR_STATUS_CONFIG, type RepairStatus } from '@/types'
import { createReply, updateRepairRequestStatus } from '@/utils/repairRequestUtils'
import { generateWorkOrderPDF, type WorkOrderData } from '@/utils/pdfGenerator'
import StatusEditModal from '@/components/common/StatusEditModal.vue'

const route = useRoute()
const router = useRouter()
const repairRequestsStore = useRepairRequestsStore()
const adminStore = useAdminStore()

const requestId = route.params.id as string
const showReplyForm = ref(false)
const replyContent = ref('')
const isSubmitting = ref(false)
const showStatusModal = ref(false)

const request = computed(() => {
  return repairRequestsStore.requests.find(r => r.id === requestId)
})

const requestReplies = computed(() => {
  return repairRequestsStore.getRequestReplies(requestId)
})

// 狀態彈窗相關方法
const openStatusModal = () => {
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
}

const handleStatusChange = async (newStatus: RepairStatus) => {
  if (!request.value) return
  
  try {
    updateRepairRequestStatus(repairRequestsStore.requests, requestId, newStatus)
    alert('狀態更新成功！')
  } catch (error) {
    alert('狀態更新失敗，請重試')
  }
}

const getStatusClass = (status: string) => {
  const config = REPAIR_STATUS_CONFIG[status as keyof typeof REPAIR_STATUS_CONFIG]
  return config ? `${config.bgColor} ${config.color}` : 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const config = REPAIR_STATUS_CONFIG[status as keyof typeof REPAIR_STATUS_CONFIG]
  return config ? config.label : status
}

const getUserName = (userId: string) => {
  const userNames: Record<string, string> = {
    'user1': '測試使用者',
    'user2': '張小明',
    'user3': '李美華'
  }
  return userNames[userId] || '未知使用者'
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

const goBack = () => {
  router.push('/admin/orders')
}


const submitReply = async () => {
  if (!replyContent.value.trim()) return

  isSubmitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 使用工具函數創建新的回覆
    const newReply = createReply({
      repairRequestId: requestId,
      adminId: adminStore.currentAdmin?.id || 'admin1',
      content: replyContent.value.trim()
    })
    
    repairRequestsStore.replies.push(newReply)
    
    // 更新對應維修單狀態
    updateRepairRequestStatus(repairRequestsStore.requests, requestId, 'in_progress')
    
    replyContent.value = ''
    showReplyForm.value = false
    
    alert('回覆已提交成功！')
  } catch (error) {
    alert('回覆失敗，請重試')
  } finally {
    isSubmitting.value = false
  }
}

const printWorkOrder = () => {
  if (!request.value) return
  
  // 解析設備和類別資訊
  const categoryParts = request.value.category.split(' - ')
  const deviceName = categoryParts[0] || ''
  const categoryName = categoryParts[1] || ''
  
  const workOrderData: WorkOrderData = {
    request: request.value,
    userInfo: {
      displayName: getUserName(request.value.userId),
      avatarUrl: undefined
    },
    deviceInfo: {
      deviceName,
      categoryName
    }
  }
  
  generateWorkOrderPDF(workOrderData)
}

onMounted(() => {
  if (!request.value) {
    router.push('/admin/orders')
  }
})
</script>
