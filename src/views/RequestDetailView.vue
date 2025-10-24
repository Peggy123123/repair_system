<template>
  <div class="container py-2">
    <!-- 頁面標題 -->
    <div class="mb-4">
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
    </div>

    <!-- 載入狀態 -->
    <div v-if="!request" class="text-center py-12">
      <font-awesome-icon 
        icon="spinner" 
        class="mx-auto h-8 w-8 text-gray-400 animate-spin"
      />
      <p class="mt-2 text-sm text-gray-500">載入中...</p>
    </div>

    <!-- 找不到記錄 -->
    <div v-else-if="!request" class="text-center py-12">
      <font-awesome-icon 
        icon="exclamation-triangle" 
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900">找不到此維修申請</h3>
      <p class="mt-1 text-sm text-gray-500">請檢查連結是否正確</p>
    </div>

    <!-- 詳細內容 -->
    <div v-else class="flex flex-col gap-3">
      <!-- 基本資訊卡片 -->
      <div class="bg-white shadow rounded-lg overflow-hidden px-4 py-5 sm:p-6 flex flex-col gap-3">
          <!-- 右上角按鈕區域 -->
          <div class="flex gap-2 justify-end mb-3">
            <!-- 新增描述按鈕 - 只有待處理和處理中狀態顯示 -->
            <Button
              v-if="canAddDescription"
              @click="showAddDescription = true"
              text="新增描述"
              icon="plus"
              variant="outline"
              size="sm"
              :full-width="false"
            />
            <!-- 取消按鈕 - 只有待處理和處理中狀態顯示 -->
            <Button
              v-if="canCancel"
              @click="showCancelModal = true"
              text="取消"
              icon="times"
              variant="danger"
              size="sm"
              :full-width="false"
            />
          </div>
          
          <div class="flex items-center space-x-3">
            <span 
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              :class="statusConfig.bgColor + ' ' + statusConfig.color"
            >
              {{ statusConfig.label }}
            </span>
            <span class="text-lg font-medium text-gray-900">{{ request.category }}</span>
          </div>

          <div class="mb-4">
            <div class="bg-gray-50 rounded-lg p-3 space-y-4">
              <h4 class="text-sm font-semibold text-gray-900"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">主題</span> {{ request.title }}</h4>
              <p class="text-sm text-gray-700 whitespace-pre-wrap"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">描述</span> {{ request.description }}</p>
            </div>
          </div>

          <!-- 附件圖片 -->
          <div v-if="hasAttachments" class="mb-6">
            <h4 class="text-lg font-medium text-gray-900 mb-3">附件圖片</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <!-- 多張圖片網格顯示 -->
              <div v-if="attachmentUrls.length > 1" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <div 
                  v-for="(url, index) in attachmentUrls" 
                  :key="index"
                  class="relative group cursor-pointer"
                  @click="showImageModal = true; currentImageIndex = index"
                >
                  <img 
                    :src="url" 
                    :alt="`附件圖片 ${index + 1}`" 
                    class="w-full h-32 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow"
                  >
                  <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-md flex items-center justify-center">
                    <font-awesome-icon 
                      icon="search-plus" 
                      class="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                </div>
              </div>
              <!-- 單張圖片顯示 -->
              <div v-else-if="attachmentUrls.length === 1">
                <img 
                  :src="attachmentUrls[0]" 
                  alt="附件圖片" 
                  class="max-w-full h-auto rounded-md shadow-sm cursor-pointer"
                  @click="showImageModal = true; currentImageIndex = 0"
                >
              </div>
            </div>
          </div>

          <div class="text-sm text-gray-500">
            <div>申請時間：{{ formatDate(request.createdAt) }}</div>
            <div>最後更新：{{ formatDate(request.updatedAt) }}</div>
          </div>
      </div>

      <!-- 使用者新增描述卡片 -->
      <div v-if="showAddDescription" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-2">新增描述</h4>
          <div class="space-y-4">
            <div>
              <label for="newDescription" class="block text-sm font-medium text-gray-700 mb-2">
                請描述您要補充的內容
              </label>
              <textarea
                id="newDescription"
                v-model="newDescription"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="請輸入您要補充的描述"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <Button
                @click="cancelAddDescription"
                text="取消"
                variant="outline"
                size="sm"
                :full-width="false"
              />
              <Button
                @click="confirmAddDescription"
                :disabled="!newDescription.trim()"
                text="確認"
                variant="primary"
                size="sm"
                :full-width="false"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 管理員回覆區域 -->
      <div v-if="replies.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">管理員回覆</h4>
          <div class="space-y-4">
            <div
              v-for="reply in replies"
              :key="reply.id"
              class="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon icon="user-shield" class="text-blue-600" />
                  <span class="text-sm font-medium text-gray-900">管理員</span>
                </div>
                <span class="text-sm text-gray-500">{{ formatDate(reply.createdAt) }}</span>
              </div>
              <p class="text-gray-700 whitespace-pre-wrap">{{ reply.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 無回覆狀態 -->
      <div v-else-if="request && request.status !== 'cancelled'" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6 text-center">
          <font-awesome-icon 
            icon="clock" 
            class="mx-auto h-8 w-8 text-gray-400 mb-2"
          />
          <p class="text-sm text-gray-500">您的維修申請已提交，管理員將盡快回覆</p>
        </div>
      </div>
    </div>

    <!-- 圖片預覽模態框 -->
    <div 
      v-if="showImageModal && hasAttachments"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="showImageModal = false"
    >
      <div class="max-w-4xl max-h-full p-4 relative">
        <img 
          :src="currentImageUrl" 
          alt="附件圖片預覽" 
          class="max-w-full max-h-full object-contain rounded-lg"
          @click.stop
        >
        <!-- 關閉按鈕 -->
        <Button 
          @click="showImageModal = false"
          text=""
          icon="times"
          variant="secondary"
          size="sm"
          :full-width="false"
          class="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
        />
        <!-- 多張圖片時的導航按鈕 -->
        <div v-if="attachmentUrls.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
          <Button 
            v-if="currentImageIndex > 0"
            @click.stop="currentImageIndex--"
            text=""
            icon="chevron-left"
            variant="secondary"
            size="sm"
            :full-width="false"
            class="pointer-events-auto bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-3 ml-4"
          />
          <Button 
            v-if="currentImageIndex < attachmentUrls.length - 1"
            @click.stop="currentImageIndex++"
            text=""
            icon="chevron-right"
            variant="secondary"
            size="sm"
            :full-width="false"
            class="pointer-events-auto bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-3 mr-4"
          />
        </div>
        <!-- 圖片計數器 -->
        <div v-if="attachmentUrls.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {{ currentImageIndex + 1 }} / {{ attachmentUrls.length }}
        </div>
      </div>
    </div>

    <!-- 取消確認模態框 -->
    <div 
      v-if="showCancelModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="showCancelModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">確認取消維修申請</h3>
        </div>
        <div class="px-6 py-4">
          <p class="text-sm text-gray-600 mb-4">
            您確定要取消此維修申請嗎？取消後將無法恢復，請謹慎考慮。
          </p>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
          <Button
            @click="showCancelModal = false"
            text="取消"
            variant="outline"
            size="sm"
            :full-width="false"
          />
          <Button
            @click="confirmCancel"
            text="確認取消"
            variant="danger"
            size="sm"
            :full-width="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRepairRequestsStore } from '@/stores/repairRequests'
import { useUserStore } from '@/stores/user'
import { REPAIR_STATUS_CONFIG } from '@/types'
import Button from '@/components/common/Button.vue'

const route = useRoute()
const router = useRouter()
const repairRequestsStore = useRepairRequestsStore()
const userStore = useUserStore()
const showImageModal = ref(false)
const showCancelModal = ref(false)
const showAddDescription = ref(false)
const newDescription = ref('')
const currentImageIndex = ref(0)

const requestId = route.params.id as string

const request = computed(() => {
  if (!userStore.currentUser) return null
  const userRequests = repairRequestsStore.getUserRequests(userStore.currentUser.id)
  return userRequests.find(r => r.id === requestId) || null
})

const statusConfig = computed(() => {
  if (!request.value) return REPAIR_STATUS_CONFIG.pending
  return REPAIR_STATUS_CONFIG[request.value.status]
})

const replies = computed(() => {
  if (!request.value) return []
  return repairRequestsStore.getRequestReplies(request.value.id)
})

// 計算附件圖片 URLs
const attachmentUrls = computed(() => {
  if (!request.value) return []
  
  // 優先使用新的 attachmentUrls 陣列
  if (request.value.attachmentUrls && request.value.attachmentUrls.length > 0) {
    return request.value.attachmentUrls
  }
  
  // 向後相容：使用單一的 attachmentUrl
  if (request.value.attachmentUrl) {
    return [request.value.attachmentUrl]
  }
  
  return []
})

// 計算是否有附件
const hasAttachments = computed(() => {
  return attachmentUrls.value.length > 0
})

// 當前顯示的圖片 URL
const currentImageUrl = computed(() => {
  return attachmentUrls.value[currentImageIndex.value] || ''
})

// 計算是否可以新增描述（只有待處理和處理中狀態可以）
const canAddDescription = computed(() => {
  if (!request.value) return false
  return request.value.status === 'pending' || request.value.status === 'in_progress'
})

// 計算是否可以取消（只有待處理和處理中狀態可以）
const canCancel = computed(() => {
  if (!request.value) return false
  return request.value.status === 'pending' || request.value.status === 'in_progress'
})

// 取消新增描述
const cancelAddDescription = () => {
  showAddDescription.value = false
  newDescription.value = ''
}

// 確認新增描述
const confirmAddDescription = () => {
  if (!request.value || !newDescription.value.trim()) return
  
  repairRequestsStore.addUserDescription(request.value.id, newDescription.value.trim())
  showAddDescription.value = false
  newDescription.value = ''
}

// 確認取消維修申請
const confirmCancel = () => {
  if (!request.value) return
  
  repairRequestsStore.updateRequestStatus(request.value.id, 'cancelled')
  showCancelModal.value = false
  router.push('/my-requests')
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
</script>
