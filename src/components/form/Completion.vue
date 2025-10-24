<template>
  <div class="bg-white shadow rounded-lg">
    <div class="px-4 py-5 sm:p-6 text-center">
      <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
        <font-awesome-icon 
          icon="check" 
          class="h-6 w-6 text-green-600"
        />
      </div>
      
      <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
        申請提交成功！
      </h3>
      
      <p class="text-sm text-gray-500 mb-8">
        您的維修申請已成功提交，我們會盡快處理您的需求。
      </p>

      <!-- 底部按鈕 -->
      <div class="flex justify-center">
        <Button
        @click="$router.push('/my-requests')"
        variant="primary"
        text="查看維修紀錄"
        :custom-class="'w-full md:w-fit'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

let handlePopState: () => void

onMounted(() => {
  // 清除瀏覽器歷史記錄，讓返回按鈕直接回到第1步
  if (window.history.replaceState) {
    // 替換當前歷史記錄為第1步
    window.history.replaceState(null, '', '/form/step1')
    // 添加新的歷史記錄
    window.history.pushState(null, '', '/form/step3?completed=true')
  }
  
  // 監聽瀏覽器返回事件
  handlePopState = () => {
    router.push('/form/step1')
  }
  
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  // 清理事件監聽器
  if (handlePopState) {
    window.removeEventListener('popstate', handlePopState)
  }
})
</script>
