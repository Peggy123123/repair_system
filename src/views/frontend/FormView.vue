<template>
  <div class="min-h-[calc(100vh-90px)] bg-gray-50 py-2 container flex flex-col gap-4">
    <!-- 圓形進度條 (完成頁不顯示) -->
    <div v-if="!isCompletionPage" class="">
      <div class="flex items-center justify-center">
        <div class="relative">
          <circle-progress
            :max="100"
            :value="progressPercentage"
            color-filled="#c42140"
            color-unfilled="#c42140"
            :width="80"
            :height="80"
          />
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center flex items-center justify-center gap-2">
              <div class="text-2xl font-bold text-primary">{{ currentStepNumber }}</div>
              <div class="text-sm text-gray-500">/ {{ totalSteps }}</div>
            </div>
          </div>
        </div>

        <div class="ml-6">
          <h2 class="text-lg font-semibold text-gray-900">{{ currentStepName }}</h2>
          <p class="text-sm text-gray-500">{{ currentStepDescription }}</p>
        </div>
      </div>
    </div>

    <!-- 步驟內容 -->
    <Completion v-if="isCompletionPage" />
    
    <router-view v-else />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Completion from '@/components/form/Completion.vue'

const route = useRoute()

const totalSteps = 3

const isCompletionPage = computed(() => {
  return route.path.includes('step3') && route.query.completed === 'true'
})

const currentStepNumber = computed(() => {
  const currentPath = route.path
  if (currentPath.includes('step1')) return 1
  if (currentPath.includes('step2')) return 2
  if (currentPath.includes('step3')) return 3
  return 1
})

const currentStepName = computed(() => {
  const currentPath = route.path
  if (currentPath.includes('step1')) return '選擇設備'
  if (currentPath.includes('step2')) return '選擇分類'
  if (currentPath.includes('step3')) {
    return isCompletionPage.value ? '完成' : '填寫詳情'
  }
  return '選擇設備'
})

const currentStepDescription = computed(() => {
  const currentPath = route.path
  if (currentPath.includes('step1')) return '請選擇您要維修的設備類型'
  if (currentPath.includes('step2')) return '請選擇具體的維修項目'
  if (currentPath.includes('step3')) {
    return isCompletionPage.value ? '維修申請已成功提交' : '請填寫詳細的維修資訊'
  }
  return '請選擇您要維修的設備類型'
})

const progressPercentage = computed(() => {
  if (isCompletionPage.value) return 100
  return (currentStepNumber.value / totalSteps) * 100
})
</script>
