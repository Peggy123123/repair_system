<template>
  <div>
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
          選擇維修項目
        </h3>
        
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <OptionButton
            v-for="device in deviceTypes"
            :key="device.id"
            :option="device"
            :is-selected="selectedDevice === device.id"
            @select="selectDevice"
          />
        </div>

        <!-- 底部按鈕 -->
        <div class="flex justify-between mt-4 gap-2">
          <Button
          @click="$router.push('/my-requests')"
            variant="secondary"
            text="取消並返回維修紀錄"
          />
          <Button
          @click="nextStep"
          :disabled="!selectedDevice"
          variant="primary"
          text="下一步"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { DEVICE_TYPES } from '@/types'
import OptionButton from '@/components/common/OptionButton.vue'

const router = useRouter()
const deviceTypes = DEVICE_TYPES
const selectedDevice = ref<string>('')

const selectDevice = (deviceId: string) => {
  selectedDevice.value = deviceId
}

const nextStep = () => {
  if (selectedDevice.value) {
    router.push(`/form/step2?device=${selectedDevice.value}`)
    // 切換步驟時回到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
