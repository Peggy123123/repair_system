<template>
  <!-- 彈窗背景 -->
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    @click="closeModal"
  >
    <div class="fixed inset-0 bg-black bg-opacity-50"></div>
    <div class="flex min-h-screen items-center justify-center p-4">
      <!-- 彈窗內容 -->
      <div
        class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto"
        @click.stop
      >
        <!-- 標題列 -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">編輯狀態</h3>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <font-awesome-icon icon="times" class="h-5 w-5" />
          </button>
        </div>

        <!-- 內容區域 -->
        <div class="p-6">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              目前狀態：{{ currentStatusLabel }}
            </label>
            <label class="block text-sm font-medium text-gray-700 mb-3">
              選擇新狀態：
            </label>
          </div>

          <!-- 狀態選項 -->
          <div class="space-y-2">
            <label
              v-for="status in statusOptions"
              :key="status.value"
              class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              :class="selectedStatus === status.value ? 'border-blue-500 bg-blue-50' : ''"
            >
              <input
                type="radio"
                :value="status.value"
                v-model="selectedStatus"
                class="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <div class="flex items-center">
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3"
                  :class="getStatusClass(status.value)"
                >
                  {{ status.label }}
                </span>
                <span class="text-sm text-gray-400">{{ status.description }}</span>
              </div>
            </label>
          </div>
        </div>

        <!-- 按鈕區域 -->
        <div class="flex justify-between space-x-3 p-6 border-t border-gray-200">
          <Button
            @click="closeModal"
            text="取消"
            variant="outline"
            size="sm"
            :full-width="true"
          />
          <Button
            @click="confirmStatusChange"
            :disabled="selectedStatus === currentStatus || isSubmitting"
            text="確認更新"
            variant="primary"
            :full-width="true"
            size="sm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { REPAIR_STATUS_CONFIG, type RepairStatus } from '@/types'

interface Props {
  isOpen: boolean
  currentStatus: RepairStatus
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  'status-change': [status: RepairStatus]
}>()

const selectedStatus = ref<RepairStatus>(props.currentStatus)
const isSubmitting = ref(false)

const statusOptions = [
  { 
    value: 'pending' as RepairStatus, 
    label: '待處理', 
    description: '等待管理員處理' 
  },
  { 
    value: 'in_progress' as RepairStatus, 
    label: '處理中', 
    description: '管理員正在處理' 
  },
  { 
    value: 'repairing' as RepairStatus, 
    label: '維修中', 
    description: '正在進行維修' 
  },
  { 
    value: 'completed' as RepairStatus, 
    label: '已完成', 
    description: '維修已完成' 
  },
  { 
    value: 'cancelled' as RepairStatus, 
    label: '已取消', 
    description: '申請已取消' 
  }
]

const currentStatusLabel = computed(() => {
  const config = REPAIR_STATUS_CONFIG[props.currentStatus]
  return config ? config.label : props.currentStatus
})

const getStatusClass = (status: RepairStatus) => {
  const config = REPAIR_STATUS_CONFIG[status]
  return config ? `${config.bgColor} ${config.color}` : 'bg-gray-100 text-gray-800'
}

const closeModal = () => {
  emit('close')
}

const confirmStatusChange = async () => {
  if (selectedStatus.value === props.currentStatus) return

  isSubmitting.value = true

  try {
    // 模擬 API 調用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    emit('status-change', selectedStatus.value)
    closeModal()
  } catch (error) {
    console.error('狀態更新失敗:', error)
    alert('狀態更新失敗，請重試')
  } finally {
    isSubmitting.value = false
  }
}

// 當彈窗打開時重置選中狀態
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    selectedStatus.value = props.currentStatus
  }
})
</script>
