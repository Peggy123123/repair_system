<template>
  <div
    :class="[
      'flex items-center justify-between border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors',
      variant === 'simple' ? 'p-3' : 'p-4'
    ]"
    @click="handleClick"
  >
    <div :class="variant === 'simple' ? 'flex items-center space-x-3' : 'flex items-center space-x-4'">
      <span 
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        :class="getStatusClass(request.status)"
      >
        {{ getStatusLabel(request.status) }}
      </span>
      <div v-if="variant === 'detailed'">
        <h3 class="text-sm font-medium text-gray-900">{{ request.title }}</h3>
        <p class="text-sm text-gray-500">分類：{{ request.category }}</p>
        <p v-if="request.deviceType" class="text-sm text-gray-500">
          機型： {{ getDeviceTypeName(request.deviceType) }}
        </p>
      </div>
      <template v-else>
        <span class="text-sm font-medium text-gray-900">{{ request.title }}</span>
        <span class="text-sm text-gray-500">{{ request.category }}</span>
      </template>
    </div>
    <div :class="variant === 'simple' ? '' : 'text-right'">
      <p :class="variant === 'simple' ? 'text-sm text-gray-500' : 'text-sm text-gray-900'">
        {{ formatDate(request.createdAt) }}
      </p>
      <p v-if="variant === 'detailed'" class="text-xs text-gray-500">
        申請人: {{ getUserName(request.userId) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RepairRequest } from '@/types'
import { REPAIR_STATUS_CONFIG, DEVICE_TYPES } from '@/types'
import { mockUsers } from '@/mock/users'

interface Props {
  request: RepairRequest
  variant?: 'simple' | 'detailed'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'detailed'
})

const emit = defineEmits<{
  click: [requestId: string]
}>()

const getStatusClass = (status: string) => {
  const config = REPAIR_STATUS_CONFIG[status as keyof typeof REPAIR_STATUS_CONFIG]
  return config ? `${config.bgColor} ${config.color}` : 'bg-gray-100 text-gray-800'
}

const getStatusLabel = (status: string) => {
  const config = REPAIR_STATUS_CONFIG[status as keyof typeof REPAIR_STATUS_CONFIG]
  return config ? config.label : status
}

const getUserName = (userId: string) => {
  const user = mockUsers.find(u => u.id === userId)
  return user ? user.displayName : '未知使用者'
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

const handleClick = () => {
  emit('click', props.request.id)
}
</script>
