<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 手機版導航欄 -->
    <nav v-if="!isAdminRoute" class="bg-primary h-[90px]">
      <div class="container">
        <div class="flex items-center py-4 justify-between">
          <h1 class="sr-only">維修系統</h1>
          <div class="w-10"></div>

          <div class="flex-1 flex justify-center">
            <img src="/src/assets/images/photo-output%202%20(1).png" alt="維修系統" class="w-20 h-auto object-contain">
          </div>


          <Button
            @click="toggleMobileMenu"
            :text="''"
            :icon="isMobileMenuOpen ? 'times' : 'bars'"
            variant="text"
            size="sm"
            :full-width="false"
            class="p-2 text-white"
          />
        </div>
      </div>
    </nav>

    <!-- 手機版側邊選單 -->
    <div v-if="!isAdminRoute">
      <!-- 背景遮罩 -->
      <div 
        v-if="isMobileMenuOpen"
        @click="closeMobileMenu"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
      ></div>
      
      <!-- 側邊選單 -->
      <div 
        class="fixed top-0 right-0 h-full w-3/5 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out"
        :class="isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'"
      >
        <div class="flex flex-col h-full">
          <!-- 選單標題 -->
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">選單</h2>
          </div>
          
          <!-- 選單項目 -->
          <div class="flex-1 px-6 py-4">
            <div class="space-y-4">
              <router-link 
                to="/form" 
                @click="closeMobileMenu"
                class="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-base font-medium transition-colors"
              >
                申請維修
              </router-link>
              <router-link 
                to="/my-requests" 
                @click="closeMobileMenu"
                class="block px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-base font-medium transition-colors"
              >
                維修紀錄
              </router-link>
            </div>
          </div>
          
          <!-- 登出按鈕 -->
          <div class="px-6 py-4 border-t border-gray-200">
            <Button
              v-if="userStore.isLoggedIn"
              @click="handleLogout"
              text="登出"
              icon="sign-out-alt"
              variant="text"
              size="md"
              :full-width="true"
              class="w-full px-4 py-3 text-primary rounded-lg text-base font-medium"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 電腦版導航（僅管理後台） -->
    <nav v-if="isAdminRoute" class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-gray-900">管理後台</h1>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/admin" 
              class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              管理後台
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <main :class="isAdminRoute ? 'max-w-7xl mx-auto py-6 sm:px-6 lg:px-8' : ''">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Button from '@/components/common/Button.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 手機版選單狀態
const isMobileMenuOpen = ref(false)

// 判斷是否為管理後台路由
const isAdminRoute = computed(() => route.path === '/admin')

// 切換手機版選單
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 關閉手機版選單
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// 登出功能
const handleLogout = () => {
  userStore.logout()
  closeMobileMenu()
  router.push('/')
}
</script>
