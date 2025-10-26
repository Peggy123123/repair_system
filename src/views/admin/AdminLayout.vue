<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 左側選單 -->
    <div class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 class="text-xl font-bold text-gray-900">維修系統後台</h1>
        </div>
        
        <!-- 選單項目 -->
        <nav class="flex-1 space-y-1 px-2 py-4">
          <router-link
            to="/admin"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path === '/admin' ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <font-awesome-icon icon="chart-bar" class="mr-3 h-5 w-5" />
            儀表板
          </router-link>
          
          <router-link
            to="/admin/orders"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path.startsWith('/admin/orders') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <font-awesome-icon icon="list" class="mr-3 h-5 w-5" />
            訂單
          </router-link>
          
          <router-link
            to="/admin/users"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path.startsWith('/admin/users') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <font-awesome-icon icon="users" class="mr-3 h-5 w-5" />
            使用者
          </router-link>
          
          <router-link
            to="/admin/admins"
            class="group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors"
            :class="$route.path.startsWith('/admin/admins') ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <font-awesome-icon icon="user-shield" class="mr-3 h-5 w-5" />
            管理者
          </router-link>
        </nav>
        
        <!-- 登出按鈕 -->
        <div class="border-t border-gray-200 p-4">
          <button
            @click="logout"
            class="flex w-full items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
          >
            <font-awesome-icon icon="sign-out-alt" class="mr-3 h-5 w-5" />
            登出
          </button>
        </div>
      </div>
    </div>
    
    <!-- 主要內容區域 -->
    <div class="pl-64">
      <main class="py-6">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'

const router = useRouter()
const adminStore = useAdminStore()

// 檢查管理員權限
onMounted(() => {
  if (!adminStore.isLoggedIn) {
    router.push('/admin/login')
  }
})

const logout = () => {
  adminStore.logout()
  router.push('/admin/login')
}
</script>
