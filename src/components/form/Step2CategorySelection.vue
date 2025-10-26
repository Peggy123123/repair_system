<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6">
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
        選擇分類
      </h3>
      
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <OptionButton
          v-for="category in availableCategories"
          :key="category.id"
          :option="category"
          :is-selected="selectedCategory === category.id"
          @select="selectCategory"
        />
      </div>

      <!-- 底部按鈕 -->
      <div class="flex justify-between mt-4 gap-2">
        <Button
        @click="prevStep"
        variant="secondary"
        text="回上一步"
        />
        <Button
        @click="nextStep"
        :disabled="!selectedCategory"
        variant="primary"
        text="下一步"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { REPAIR_SUB_CATEGORIES } from '@/types'
import OptionButton from '@/components/common/OptionButton.vue'

const router = useRouter()
const route = useRoute()
const selectedCategory = ref<string>('')

const selectedDevice = computed(() => route.query.device as string)

const availableCategories = computed(() => {
  if (!selectedDevice.value) return []
  return REPAIR_SUB_CATEGORIES.filter(category => 
    category.deviceTypes.includes(selectedDevice.value)
  )
})

const selectCategory = (categoryId: string) => {
  selectedCategory.value = categoryId
}

const prevStep = () => {
  router.push('/form/step1')
  // 切換步驟時回到頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const nextStep = () => {
  if (selectedCategory.value) {
    router.push(`/form/step3?device=${selectedDevice.value}&category=${selectedCategory.value}`)
    // 切換步驟時回到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>
