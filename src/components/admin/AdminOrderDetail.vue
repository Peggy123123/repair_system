<template>
  <div>
    <!-- Loading 狀態 -->
    <LoadingSpinner v-if="isLoading" message="載入中..." />

    <template v-else>
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

      <div v-if="!order" class="text-center py-8">
        <p class="text-gray-500">找不到指定的訂單</p>
      </div>

      <div v-else>
      <!-- 訂單標題 -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">{{ order.title }}</h2>
        <p class="mt-1 text-sm text-gray-600">訂單編號: {{ order.id }}</p>
      </div>

      <!-- 訂單資訊 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 主要資訊 -->
        <div class="lg:col-span-2">
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg leading-6 font-medium text-gray-900">訂單詳情</h3>
                <button
                  v-if="!isEditingOrderDetails"
                  @click="startEditOrderDetails"
                  class="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                  title="編輯"
                >
                  <font-awesome-icon icon="edit" class="h-4 w-4" />
                </button>
              </div>

              <!-- 顯示模式 -->
              <div v-if="!isEditingOrderDetails">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt class="text-sm font-medium text-gray-500">申請人</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ order.userName || '未知使用者' }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">機型</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ getDeviceTypeName(order.deviceType) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">類別</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ order.category }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">申請時間</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(order.createdAt) }}</dd>
                  </div>
                  <div>
                    <dt class="text-sm font-medium text-gray-500">最後更新</dt>
                    <dd class="mt-1 text-sm text-gray-900">{{ formatDate(order.updatedAt) }}</dd>
                  </div>
                </dl>

                <div class="mt-6">
                  <dt class="text-sm font-medium text-gray-500 mb-2">問題描述</dt>
                  <dd class="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-md">
                    {{ order.description }}
                  </dd>
                </div>
              </div>

              <!-- 編輯模式 -->
              <form v-else @submit.prevent="submitOrderDetails" class="space-y-4">
                <div>
                  <label for="edit-device-type" class="block text-sm font-medium text-gray-700 mb-1">機型</label>
                  <select
                    id="edit-device-type"
                    v-model="editOrderForm.deviceType"
                    required
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option v-for="device in DEVICE_TYPES" :key="device.id" :value="device.id">
                      {{ device.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label for="edit-category" class="block text-sm font-medium text-gray-700 mb-1">類別</label>
                  <select
                    id="edit-category"
                    v-model="editOrderForm.category"
                    required
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option v-for="cat in REPAIR_SUB_CATEGORIES" :key="cat.id" :value="cat.name">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
                <div>
                  <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-1">問題描述</label>
                  <textarea
                    id="edit-description"
                    v-model="editOrderForm.description"
                    required
                    rows="4"
                    class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="請輸入問題描述..."
                  ></textarea>
                </div>
                <div class="flex justify-end space-x-3">
                  <button
                    type="button"
                    @click="cancelEditOrderDetails"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    :disabled="isSubmittingContent"
                    class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {{ isSubmittingContent ? '儲存中...' : '儲存' }}
                  </button>
                </div>
              </form>

              <!-- 補充資料 -->
              <div v-if="order.supplements && order.supplements.length > 0" class="mt-6">
                <dt class="text-sm font-medium text-gray-500 mb-2">補充資料</dt>
                <div class="space-y-4">
                  <div
                    v-for="(supplement, index) in order.supplements"
                    :key="index"
                    class="bg-yellow-50 border border-yellow-200 rounded-md p-4"
                  >
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-yellow-700">補充 #{{ index + 1 }}</span>
                      <span class="text-xs text-gray-500">{{ formatDate(supplement.createdAt) }}</span>
                    </div>
                    <p v-if="supplement.content" class="text-sm text-gray-900 whitespace-pre-wrap">{{ supplement.content }}</p>
                    <div
                      v-if="supplement.attachmentUrls && supplement.attachmentUrls.length > 0"
                      class="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
                    >
                      <img
                        v-for="(url, imgIdx) in supplement.attachmentUrls"
                        :key="imgIdx"
                        :src="url"
                        :alt="`補充圖片 ${imgIdx + 1}`"
                        class="h-28 w-full object-cover rounded-md"
                      >
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="hasAttachments" class="mt-6">
                <dt class="text-sm font-medium text-gray-500 mb-2">附件圖片</dt>
                <div class="mt-2">
                  <!-- 多張圖片網格顯示 -->
                  <div v-if="attachmentUrls.length > 1" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <img
                      v-for="(url, index) in attachmentUrls"
                      :key="index"
                      :src="url"
                      :alt="`附件圖片 ${index + 1}`"
                      class="h-32 w-full object-cover rounded-md"
                    >
                  </div>
                  <!-- 單張圖片顯示 -->
                  <img v-else :src="attachmentUrls[0]" alt="附件圖片" class="h-32 w-32 object-cover rounded-md">
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
                :class="getStatusClass(order.status)"
              >
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
          </div>

          <!-- 操作 -->
          <div class="bg-white shadow rounded-lg">
            <div class="px-4 py-5 sm:p-6">
              <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">操作</h3>

              <div class="space-y-3">
                <button
                  @click="toggleReplyForm"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  <font-awesome-icon icon="reply" class="mr-2" />
                  回覆
                </button>
                <!-- 已存在維修內容時禁用 -->
                <button
                  @click="openRepairContentForm"
                  :disabled="showRepairContentForm || !!order?.repairContent"
                  class="w-full text-left px-3 py-2 text-sm rounded-md"
                  :class="showRepairContentForm || !!order?.repairContent ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'"
                >
                  <font-awesome-icon icon="wrench" class="mr-2" />
                  填寫維修內容
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
              <!-- 顯示模式 -->
              <div v-if="editingReplyId !== reply.id">
                <div class="flex justify-between mb-2">
                  <span class="text-sm font-medium text-gray-900">管理員</span>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="startEditReply(reply)"
                      class="p-1 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                      title="編輯"
                    >
                      <font-awesome-icon icon="edit" class="h-3.5 w-3.5" />
                    </button>
                    <button
                      @click="deleteReplyItem(reply.id)"
                      class="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                      title="刪除"
                    >
                      <font-awesome-icon icon="trash" class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p class="text-sm text-gray-700 mb-2">{{ reply.content }}</p>
                <div class="text-xs text-gray-500">
                  <div>新增：{{ formatDate(reply.createdAt) }}</div>
                  <div v-if="reply.updatedAt !== reply.createdAt">更新：{{ formatDate(reply.updatedAt) }}</div>
                </div>
              </div>

              <!-- 編輯模式 -->
              <form v-else @submit.prevent="submitEditReply(reply.id)" class="space-y-3">
                <textarea
                  v-model="editingReplyContent"
                  required
                  rows="3"
                  class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="請輸入回覆內容..."
                ></textarea>
                <div class="flex justify-end space-x-2">
                  <button
                    type="button"
                    @click="cancelEditReply"
                    class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- 回覆表單 -->
      <div v-if="showReplyForm" ref="replyFormRef" class="bg-white shadow rounded-lg mb-6">
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

      <!-- 維修內容卡片（新增/編輯/顯示統一在此） -->
      <div v-if="order.repairContent || showRepairContentForm" ref="repairContentFormRef" class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ order.repairContent && !isEditingRepairContent ? '維修內容' : '填寫維修內容' }}
            </h3>
            <!-- 顯示模式下的編輯/刪除 icon -->
            <div v-if="order.repairContent && !isEditingRepairContent" class="flex items-center space-x-2">
              <button
                @click="startEditRepairContent"
                class="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
                title="編輯"
              >
                <font-awesome-icon icon="edit" class="h-4 w-4" />
              </button>
              <button
                @click="deleteRepairContent"
                class="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
                title="刪除"
              >
                <font-awesome-icon icon="trash" class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- 顯示模式 -->
          <div v-if="order.repairContent && !isEditingRepairContent">
            <p class="text-sm text-gray-700 whitespace-pre-wrap bg-green-50 border border-green-200 p-4 rounded-md">
              {{ order.repairContent }}
            </p>
          </div>

          <!-- 編輯模式 -->
          <form v-else @submit.prevent="submitRepairContent" class="space-y-4">
            <div>
              <label for="repair-content" class="block text-sm font-medium text-gray-700 mb-1">
                維修內容
              </label>
              <textarea
                id="repair-content"
                v-model="repairContentText"
                required
                rows="4"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入維修內容..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="closeRepairContentForm"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmittingContent"
                class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {{ isSubmittingContent ? '提交中...' : '儲存維修內容' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- 備註卡片 -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">備註</h3>
            <!-- 顯示模式下的編輯 icon -->
            <button
              v-if="!isEditingNotes"
              @click="startEditNotes"
              class="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
              title="編輯"
            >
              <font-awesome-icon icon="edit" class="h-4 w-4" />
            </button>
          </div>

          <!-- 顯示模式 -->
          <div v-if="!isEditingNotes">
            <p v-if="order.notes && order.notes.trim()" class="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-200 p-4 rounded-md">
              {{ order.notes }}
            </p>
            <p v-else class="text-sm text-gray-400 italic">尚無備註</p>
          </div>

          <!-- 編輯模式 -->
          <form v-else @submit.prevent="submitNotes" class="space-y-4">
            <div>
              <label for="notes-text" class="block text-sm font-medium text-gray-700 mb-1">
                備註內容
              </label>
              <textarea
                id="notes-text"
                v-model="notesText"
                rows="4"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入備註內容..."
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="cancelEditNotes"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmittingNotes"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmittingNotes ? '儲存中...' : '儲存備註' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

      <!-- 狀態編輯彈窗 -->
      <StatusEditModal
        :is-open="showStatusModal"
        :current-status="order?.status || 'pending'"
        @close="closeStatusModal"
        @status-change="handleStatusChange"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { REPAIR_STATUS_CONFIG, DEVICE_TYPES, REPAIR_SUB_CATEGORIES, type RepairStatus, type RepairOrderWithUser, type Reply } from '@/types'
import { updateOrder, createOrderReply, getOrderById, getOrderReplies, generateOrderPDF, updateOrderReply, deleteOrderReply } from '@/services/api'
import StatusEditModal from '@/components/admin/shared/StatusEditModal.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const toast = useToast()

const route = useRoute()
const router = useRouter()

const requestId = route.params.id as string
const showReplyForm = ref(false)
const replyContent = ref('')
const isSubmitting = ref(false)
const showStatusModal = ref(false)
const showRepairContentForm = ref(false)
const repairContentText = ref('')
const isSubmittingContent = ref(false)
const isEditingRepairContent = ref(false)

// 訂單詳情編輯相關
const isEditingOrderDetails = ref(false)
const editOrderForm = ref({
  deviceType: '',
  category: '',
  description: ''
})

// 回覆編輯相關
const editingReplyId = ref<string | null>(null)
const editingReplyContent = ref('')

// 備註相關
const isEditingNotes = ref(false)
const notesText = ref('')
const isSubmittingNotes = ref(false)

const order = ref<RepairOrderWithUser | null>(null)
const requestReplies = ref<Reply[]>([])
const isLoading = ref(true)

// Template refs for scrolling
const repairContentFormRef = ref<HTMLElement | null>(null)
const replyFormRef = ref<HTMLElement | null>(null)

// 計算附件圖片 URLs（多張圖片）
const attachmentUrls = computed(() => {
  if (!order.value) return []
  return order.value.attachmentUrls || []
})

// 計算是否有附件
const hasAttachments = computed(() => {
  return attachmentUrls.value.length > 0
})

// 狀態彈窗相關方法
const openStatusModal = () => {
  showStatusModal.value = true
}

const closeStatusModal = () => {
  showStatusModal.value = false
}

const handleStatusChange = async (newStatus: RepairStatus) => {
  if (!order.value) return

  try {
    const updated = await updateOrder(requestId, { status: newStatus })
    order.value = { ...order.value, ...updated }
    toast.success('狀態更新成功')
  } catch {
    toast.error('狀態更新失敗，請稍後再試')
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

const getDeviceTypeName = (deviceTypeId: string) => {
  const deviceType = DEVICE_TYPES.find(dt => dt.id === deviceTypeId)
  return deviceType ? deviceType.name : deviceTypeId
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

const toggleReplyForm = async () => {
  showReplyForm.value = !showReplyForm.value

  // 如果打開表單，滾動到表單位置
  if (showReplyForm.value) {
    await nextTick()
    replyFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const submitReply = async () => {
  if (!replyContent.value.trim()) return

  isSubmitting.value = true

  try {
    const newReply = await createOrderReply(requestId, replyContent.value.trim())
    requestReplies.value.push(newReply)

    // 更新對應維修單狀態
    const updated = await updateOrder(requestId, { status: 'in_progress' })
    if (order.value) {
      order.value = { ...order.value, ...updated }
    }

    replyContent.value = ''
    showReplyForm.value = false
    toast.success('回覆已送出')
  } catch {
    toast.error('回覆失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

const openRepairContentForm = async () => {
  showRepairContentForm.value = true
  repairContentText.value = ''

  // 等待 DOM 更新後滾動到表單
  await nextTick()
  repairContentFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const startEditRepairContent = async () => {
  isEditingRepairContent.value = true
  repairContentText.value = order.value?.repairContent || ''

  // 等待 DOM 更新後滾動到表單
  await nextTick()
  repairContentFormRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const closeRepairContentForm = () => {
  showRepairContentForm.value = false
  isEditingRepairContent.value = false
  repairContentText.value = ''
}

const deleteRepairContent = async () => {
  if (!order.value) return
  try {
    const updated = await updateOrder(requestId, { repairContent: '' })
    order.value = { ...order.value, ...updated, repairContent: '' }
    repairContentText.value = ''
    showRepairContentForm.value = false
    toast.success('維修內容已刪除')
  } catch {
    toast.error('刪除維修內容失敗，請稍後再試')
  }
}

const submitRepairContent = async () => {
  if (!repairContentText.value.trim()) return

  isSubmittingContent.value = true
  try {
    const updated = await updateOrder(requestId, { repairContent: repairContentText.value.trim() })
    if (order.value) {
      order.value = { ...order.value, ...updated }
    }
    showRepairContentForm.value = false
    isEditingRepairContent.value = false
    toast.success('維修內容已儲存')
  } catch {
    toast.error('儲存維修內容失敗，請稍後再試')
  } finally {
    isSubmittingContent.value = false
  }
}

const printWorkOrder = async () => {
  if (!order.value) return

  try {
    await generateOrderPDF(requestId, order.value.userName)
  } catch {
    console.error('PDF 下載失敗')
  }
}

// 訂單詳情編輯相關函數
const startEditOrderDetails = () => {
  if (!order.value) return
  isEditingOrderDetails.value = true
  editOrderForm.value = {
    deviceType: order.value.deviceType,
    category: order.value.category,
    description: order.value.description
  }
}

const cancelEditOrderDetails = () => {
  isEditingOrderDetails.value = false
  editOrderForm.value = { deviceType: '', category: '', description: '' }
}

const submitOrderDetails = async () => {
  if (!order.value) return

  isSubmittingContent.value = true
  try {
    const updated = await updateOrder(requestId, {
      deviceType: editOrderForm.value.deviceType,
      category: editOrderForm.value.category,
      description: editOrderForm.value.description
    })
    if (order.value) {
      order.value = { ...order.value, ...updated }
    }
    isEditingOrderDetails.value = false
    toast.success('訂單詳情已更新')
  } catch {
    toast.error('更新訂單失敗，請稍後再試')
  } finally {
    isSubmittingContent.value = false
  }
}

// 回覆編輯相關函數
const startEditReply = (reply: Reply) => {
  editingReplyId.value = reply.id
  editingReplyContent.value = reply.content
}

const cancelEditReply = () => {
  editingReplyId.value = null
  editingReplyContent.value = ''
}

const submitEditReply = async (replyId: string) => {
  if (!editingReplyContent.value.trim()) return

  try {
    const updated = await updateOrderReply(requestId, replyId, editingReplyContent.value.trim())
    const index = requestReplies.value.findIndex(r => r.id === replyId)
    if (index !== -1) {
      requestReplies.value[index] = updated
    }
    editingReplyId.value = null
    editingReplyContent.value = ''
    toast.success('回覆已更新')
  } catch {
    toast.error('更新回覆失敗，請稍後再試')
  }
}

const deleteReplyItem = async (replyId: string) => {
  // 使用 toast 提示而非 confirm
  try {
    await deleteOrderReply(requestId, replyId)
    requestReplies.value = requestReplies.value.filter(r => r.id !== replyId)
    toast.success('回覆已刪除')
  } catch {
    toast.error('刪除回覆失敗，請稍後再試')
  }
}

// 備註相關函數
const startEditNotes = () => {
  isEditingNotes.value = true
  notesText.value = order.value?.notes || ''
}

const cancelEditNotes = () => {
  isEditingNotes.value = false
  notesText.value = ''
}

const submitNotes = async () => {
  isSubmittingNotes.value = true
  try {
    const updated = await updateOrder(requestId, { notes: notesText.value.trim() })
    if (order.value) {
      order.value = { ...order.value, ...updated }
    }
    isEditingNotes.value = false
    toast.success('備註已儲存')
  } catch {
    toast.error('儲存備註失敗，請稍後再試')
  } finally {
    isSubmittingNotes.value = false
  }
}

onMounted(async () => {
  try {
    const [orderData, repliesData] = await Promise.all([
      getOrderById(requestId, true),
      getOrderReplies(requestId, true)
    ])
    order.value = orderData
    requestReplies.value = repliesData
  } catch {
    router.push('/admin/orders')
  } finally {
    isLoading.value = false
  }
})
</script>
