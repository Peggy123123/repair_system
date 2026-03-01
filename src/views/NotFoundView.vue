<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="text-center space-y-6">
      <p class="text-8xl font-extrabold text-primary">404</p>
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-textColor">找不到此頁面</h1>
        <p class="text-gray-500 text-sm">您要找的頁面不存在或已被移除。</p>
      </div>
      <Button
        text="返回首頁"
        icon="arrow-left"
        variant="primary"
        size="md"
        @click="router.push('/')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
