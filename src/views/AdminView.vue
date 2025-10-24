<template>
  <div class="max-w-6xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">管理後台</h2>
      <p class="mt-1 text-sm text-gray-600">管理維修申請與回覆</p>
    </div>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="file-alt" 
                class="h-6 w-6 text-gray-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">總申請數</dt>
                <dd class="text-lg font-medium text-gray-900">{{ allRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="clock" 
                class="h-6 w-6 text-yellow-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">待處理</dt>
                <dd class="text-lg font-medium text-gray-900">{{ pendingRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <font-awesome-icon 
                icon="check-circle" 
                class="h-6 w-6 text-green-400"
              />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">已回覆</dt>
                <dd class="text-lg font-medium text-gray-900">{{ repliedRequests.length }}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 申請列表 -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">維修申請列表</h3>
        
        <div v-if="allRequests.length === 0" class="text-center py-8">
          <p class="text-gray-500">尚無維修申請</p>
        </div>

        <div v-else class="space-y-6">
          <div
            v-for="request in allRequests"
            :key="request.id"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'">
                  {{ request.status === 'pending' ? '待處理' : '已回覆' }}
                </span>
                <span class="text-sm font-medium text-gray-900">{{ request.category }}</span>
                <span class="text-sm text-gray-500">申請人: {{ getUserName(request.userId) }}</span>
              </div>
              <span class="text-sm text-gray-500">
                {{ formatDate(request.createdAt) }}
              </span>
            </div>

            <div class="mb-3">
              <h4 class="text-sm font-medium text-gray-900 mb-1">問題描述</h4>
              <p class="text-gray-700 text-sm whitespace-pre-wrap">{{ request.description }}</p>
            </div>

            <div v-if="request.attachmentUrl" class="mb-3">
              <h4 class="text-sm font-medium text-gray-900 mb-1">附件圖片</h4>
              <img :src="request.attachmentUrl" alt="附件圖片" class="h-24 w-24 object-cover rounded-md">
            </div>

            <!-- 回覆區域 -->
            <div v-if="requestReplies[request.id]?.length > 0" class="mb-3">
              <h4 class="text-sm font-medium text-gray-900 mb-2">回覆記錄</h4>
              <div class="space-y-2">
                <div
                  v-for="reply in requestReplies[request.id]"
                  :key="reply.id"
                  class="bg-gray-50 rounded p-3 text-sm"
                >
                  <div class="flex justify-between mb-1">
                    <span class="font-medium">管理員</span>
                    <span class="text-gray-500">{{ formatDate(reply.createdAt) }}</span>
                  </div>
                  <p class="text-gray-700">{{ reply.content }}</p>
                </div>
              </div>
            </div>

            <!-- 回覆表單 -->
            <div v-if="request.status === 'pending'" class="border-t pt-3">
              <form @submit.prevent="submitReply(request.id)" class="space-y-3">
                <div>
                  <label for="reply-content" class="block text-sm font-medium text-gray-700 mb-1">
                    回覆內容
                  </label>
                  <textarea
                    id="reply-content"
                    v-model="replyForms[request.id]"
                    required
                    rows="3"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="請輸入回覆內容..."
                  ></textarea>
                </div>
                <div class="flex justify-end">
                  <Button
                    type="submit"
                    :disabled="isSubmitting[request.id]"
                    :loading="isSubmitting[request.id]"
                    :loading-text="'回覆中...'"
                    text="回覆"
                    variant="primary"
                    size="sm"
                    :full-width="false"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import Button from '@/components/common/Button.vue'

const repairRequestsStore = useRepairRequestsStore()

const replyForms = reactive<Record<string, string>>({})
const isSubmitting = reactive<Record<string, boolean>>({})

const allRequests = computed(() => repairRequestsStore.requests)
const pendingRequests = computed(() => repairRequestsStore.requests.filter(r => r.status === 'pending'))
const repliedRequests = computed(() => repairRequestsStore.requests.filter(r => r.status === 'in_progress' || r.status === 'completed'))

const requestReplies = computed(() => {
  const replies: Record<string, any[]> = {}
  allRequests.value.forEach(request => {
    replies[request.id] = repairRequestsStore.getRequestReplies(request.id)
  })
  return replies
})

// Mock 使用者名稱
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

const submitReply = async (requestId: string) => {
  const content = replyForms[requestId]
  if (!content.trim()) return

  isSubmitting[requestId] = true

  try {
    // Mock API 呼叫
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    repairRequestsStore.addReply({
      repairRequestId: requestId,
      adminId: 'admin1',
      content: content.trim()
    })
    
    // 清空表單
    replyForms[requestId] = ''
    
    alert('回覆已提交成功！')
  } catch (error) {
    alert('回覆失敗，請重試')
  } finally {
    isSubmitting[requestId] = false
  }
}
</script>
