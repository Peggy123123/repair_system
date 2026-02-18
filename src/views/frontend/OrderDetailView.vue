<template>
  <div class="container py-2">
    <!-- Loading 狀態 -->
    <LoadingSpinner v-if="isLoading" message="載入中..." />

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

    <!-- 找不到記錄 -->
    <div v-if="!isLoading && !order" class="text-center py-12">
      <font-awesome-icon
        icon="exclamation-triangle"
        class="mx-auto h-12 w-12 text-gray-400"
      />
      <h3 class="mt-2 text-sm font-medium text-gray-900">找不到此維修申請</h3>
      <p class="mt-1 text-sm text-gray-500">請檢查連結是否正確</p>
    </div>

    <!-- 詳細內容 -->
    <div v-else-if="!isLoading && order" class="flex flex-col gap-3">
      <!-- 基本資訊卡片 -->
      <div class="bg-white shadow rounded-lg overflow-hidden px-4 py-5 sm:p-6 flex flex-col gap-3">
          <!-- 右上角按鈕區域 -->
          <div class="flex gap-2 justify-end mb-3">
            <!-- 新增描述按鈕 - 只有待處理和處理中狀態顯示 -->
            <Button
              v-if="canAddDescription"
              @click="openAddDescription"
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
            <span class="text-lg font-medium text-gray-900">{{ order.category }}</span>
          </div>

          <div class="mb-4">
            <div class="bg-gray-50 rounded-lg p-3 space-y-4">
              <h4 class="text-sm font-semibold text-gray-900"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">主題</span> {{ order.title }}</h4>
              <p class="text-sm text-gray-700 whitespace-pre-wrap"><span class="bg-red-600/20 text-primary px-2 py-1 rounded-md text-sm">描述</span> {{ order.description }}</p>
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
                  @click="openOriginalImage(index)"
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
                  @click="openOriginalImage(0)"
                >
              </div>
            </div>
          </div>

          <div class="text-sm text-gray-500">
            <div>申請時間：{{ formatDate(order.createdAt) }}</div>
            <div>最後更新：{{ formatDate(order.updatedAt) }}</div>
          </div>
      </div>

      <!-- 補充描述歷史卡片 -->
      <div v-if="order.supplements && order.supplements.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">補充描述</h4>
          <div class="space-y-4">
            <div
              v-for="supplement in order.supplements"
              :key="supplement.id"
              class="bg-gray-50 rounded-lg p-4 border-l-4 border-primary"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <font-awesome-icon icon="user" class="text-primary" />
                  <span class="text-sm font-medium text-gray-900">使用者補充</span>
                </div>
                <span class="text-sm text-gray-500">{{ formatDate(supplement.createdAt) }}</span>
              </div>
              <!-- 補充文字內容 -->
              <p v-if="supplement.content" class="text-gray-700 whitespace-pre-wrap mb-3">{{ supplement.content }}</p>
              <!-- 補充圖片 -->
              <div v-if="supplement.attachmentUrls && supplement.attachmentUrls.length > 0">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  <div
                    v-for="(url, imgIndex) in supplement.attachmentUrls"
                    :key="imgIndex"
                    class="relative group cursor-pointer"
                    @click="openSupplementImage(supplement.id, imgIndex)"
                  >
                    <img
                      :src="url"
                      :alt="`補充圖片 ${imgIndex + 1}`"
                      class="w-full h-24 object-cover rounded-md shadow-sm hover:shadow-md transition-shadow"
                    >
                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-md flex items-center justify-center">
                      <font-awesome-icon
                        icon="search-plus"
                        class="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 使用者新增描述卡片 -->
      <div
        v-if="showAddDescription"
        ref="addDescriptionRef"
        class="bg-white shadow rounded-lg overflow-hidden"
      >
        <div class="px-4 py-5 sm:p-6">
          <h4 class="text-lg font-medium text-gray-900 mb-4">補充描述</h4>
          <div class="space-y-4">
            <!-- 文字描述 -->
            <div>
              <label for="newDescription" class="block text-sm font-medium text-gray-700 mb-2">
                補充說明
              </label>
              <textarea
                id="newDescription"
                v-model="newDescription"
                rows="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="請輸入您要補充的描述"
              ></textarea>
            </div>

            <!-- 圖片上傳 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                補充圖片
              </label>
              <div class="border-2 border-gray-300 border-dashed rounded-md p-4">
                <div class="text-center">
                  <font-awesome-icon
                    icon="upload"
                    class="mx-auto h-6 w-6 text-gray-400"
                  />
                  <div class="flex text-sm text-gray-600 items-center justify-center mt-2">
                    <label for="supplement-file-upload" class="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80">
                      <span>上傳檔案</span>
                      <input
                        id="supplement-file-upload"
                        type="file"
                        class="sr-only"
                        @change="handleSupplementFileUpload"
                        accept="image/*"
                        multiple
                      >
                    </label>
                    <p class="pl-1">或拖放檔案到此處</p>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">PNG, JPG, GIF 最大 10MB，最多 6 張圖片</p>
                </div>
              </div>

              <!-- 已上傳的補充圖片預覽 -->
              <div v-if="supplementImages.length > 0" class="mt-4">
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div
                    v-for="(url, index) in supplementImages"
                    :key="index"
                    class="relative group"
                  >
                    <img
                      :src="url"
                      :alt="`補充圖片 ${index + 1}`"
                      class="h-24 w-full object-cover rounded-md border border-gray-200"
                    >
                    <button
                      @click="removeSupplementImage(index)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <font-awesome-icon icon="times" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 按鈕區域 -->
            <div class="flex justify-end space-x-3 pt-2">
              <Button
                @click="cancelAddDescription"
                text="取消"
                variant="outline"
                size="sm"
                :full-width="false"
              />
              <Button
                @click="confirmAddDescription"
                :disabled="!newDescription.trim() && supplementImages.length === 0"
                text="確認送出"
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
      <div v-else-if="order && order.status !== 'cancelled'" class="bg-white shadow rounded-lg overflow-hidden">
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
      v-if="showImageModal && activeImageList.length > 0"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click="showImageModal = false; currentSupplementId = null"
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
          @click="showImageModal = false; currentSupplementId = null"
          text=""
          icon="times"
          variant="secondary"
          size="sm"
          :full-width="false"
          class="absolute top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2"
        />
        <!-- 多張圖片時的導航按鈕 -->
        <div v-if="activeImageList.length > 1" class="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none">
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
            v-if="currentImageIndex < activeImageList.length - 1"
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
        <div v-if="activeImageList.length > 1" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          {{ currentImageIndex + 1 }} / {{ activeImageList.length }}
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
import { computed, ref, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getOrderById, getOrderReplies, addSupplementToOrder, updateOrder } from '@/services/api'
import { REPAIR_STATUS_CONFIG, type RepairOrder, type Reply } from '@/types'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const toast = useToast()

const route = useRoute()
const router = useRouter()
const showImageModal = ref(false)
const showCancelModal = ref(false)
const showAddDescription = ref(false)
const newDescription = ref('')
const supplementImages = ref<string[]>([])
const currentImageIndex = ref(0)
const addDescriptionRef = ref<HTMLElement | null>(null)
const currentSupplementId = ref<string | null>(null) // 用於追蹤正在檢視的補充記錄圖片

const MAX_SUPPLEMENT_IMAGES = 6

const orderId = route.params.id as string
const isSubmitting = ref(false)

const order = ref<RepairOrder | null>(null)
const replies = ref<Reply[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [orderData, repliesData] = await Promise.all([
      getOrderById(orderId),
      getOrderReplies(orderId)
    ])
    order.value = orderData
    replies.value = repliesData
  } catch {
    // API 錯誤
  } finally {
    isLoading.value = false
  }
})

const statusConfig = computed(() => {
  if (!order.value) return REPAIR_STATUS_CONFIG.pending
  return REPAIR_STATUS_CONFIG[order.value.status]
})

// 計算附件圖片 URLs（多張圖片）
const attachmentUrls = computed(() => {
  if (!order.value) return []
  return order.value.attachmentUrls || []
})

// 計算是否有附件
const hasAttachments = computed(() => {
  return attachmentUrls.value.length > 0
})

// 當前顯示的圖片來源列表（原始附件或補充記錄圖片）
const activeImageList = computed(() => {
  if (currentSupplementId.value) {
    return currentSupplementImages.value
  }
  return attachmentUrls.value
})

// 當前顯示的圖片 URL
const currentImageUrl = computed(() => {
  return activeImageList.value[currentImageIndex.value] || ''
})

// 計算是否可以新增描述（只有待處理和處理中狀態可以）
const canAddDescription = computed(() => {
  if (!order.value) return false
  return order.value.status === 'pending' || order.value.status === 'in_progress'
})

// 計算是否可以取消（只有待處理和處理中狀態可以）
const canCancel = computed(() => {
  if (!order.value) return false
  return order.value.status === 'pending' || order.value.status === 'in_progress'
})

// 計算當前正在檢視的補充記錄圖片列表
const currentSupplementImages = computed(() => {
  if (!currentSupplementId.value || !order.value?.supplements) return []
  const supplement = order.value.supplements.find(s => s.id === currentSupplementId.value)
  return supplement?.attachmentUrls || []
})

// 打開補充記錄的圖片預覽
const openSupplementImage = (supplementId: string, imageIndex: number) => {
  currentSupplementId.value = supplementId
  currentImageIndex.value = imageIndex
  showImageModal.value = true
}

// 打開原始附件圖片預覽
const openOriginalImage = (imageIndex: number) => {
  currentSupplementId.value = null
  currentImageIndex.value = imageIndex
  showImageModal.value = true
}

// 打開新增描述區域並 scroll 到該位置
const openAddDescription = async () => {
  showAddDescription.value = true
  await nextTick()
  if (addDescriptionRef.value) {
    addDescriptionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 處理補充圖片上傳
const handleSupplementFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const remainingSlots = MAX_SUPPLEMENT_IMAGES - supplementImages.value.length

    if (remainingSlots <= 0) {
      toast.warning(`最多只能上傳 ${MAX_SUPPLEMENT_IMAGES} 張圖片`)
      return
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots)

    if (files.length > remainingSlots) {
      toast.warning(`已達上限,僅上傳前 ${remainingSlots} 張圖片`)
    }

    filesToProcess.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          supplementImages.value.push(result)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  // 清空 input 以便重複選擇相同檔案
  target.value = ''
}

// 移除補充圖片
const removeSupplementImage = (index: number) => {
  supplementImages.value.splice(index, 1)
}

// 取消新增描述
const cancelAddDescription = () => {
  showAddDescription.value = false
  newDescription.value = ''
  supplementImages.value = []
}

// 確認新增描述（透過 API 寫入資料庫）
const confirmAddDescription = async () => {
  if (!order.value) return
  if (!newDescription.value.trim() && supplementImages.value.length === 0) return
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const updated = await addSupplementToOrder(order.value.id, {
      content: newDescription.value.trim(),
      attachmentUrls: supplementImages.value.length > 0 ? supplementImages.value : undefined
    })
    order.value = updated
    showAddDescription.value = false
    newDescription.value = ''
    supplementImages.value = []
    toast.success('補充描述已送出')
  } catch {
    toast.error('補充描述提交失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 確認取消維修申請（透過 API 寫入資料庫）
const confirmCancel = async () => {
  if (!order.value) return
  if (isSubmitting.value) return

  isSubmitting.value = true
  try {
    const updated = await updateOrder(order.value.id, { status: 'cancelled' })
    order.value = updated
    showCancelModal.value = false
    toast.success('維修申請已取消')
    router.push('/my-orders')
  } catch {
    toast.error('取消申請失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
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
