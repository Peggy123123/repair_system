<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 手機版導航欄 - 前台顯示 -->
    <nav v-if="!isAdminRoute" class="bg-primary h-[90px]">
      <div class="container">
        <div class="flex items-center py-4 justify-between">
          <h1 class="sr-only">維修系統</h1>
          <div class="w-10"></div>

          <div class="flex-1 flex justify-center">
            <img src="/src/assets/images/logo.png" alt="維修系統" class="w-20 h-auto object-contain">
          </div>

          <!-- 漢堡選單按鈕 - 只在登入後顯示 -->
          <Button
            v-if="frontendUserStore.isLoggedIn"
            @click="toggleMobileMenu"
            :text="''"
            :icon="isMobileMenuOpen ? 'times' : 'bars'"
            variant="text"
            size="sm"
            :full-width="false"
            class="p-2 text-white"
          />
          <div v-else class="w-10"></div>
        </div>
      </div>
    </nav>

    <!-- 手機版側邊選單 - 只在前台且已登入時顯示 -->
    <div v-if="!isAdminRoute && frontendUserStore.isLoggedIn">
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
            <h2 class="text-lg font-semibold text-textColor">選單</h2>
          </div>
          
          <!-- 選單項目 -->
          <div class="flex-1 px-6 py-4">
            <div class="space-y-4">
              <router-link 
                to="/form" 
                @click="closeMobileMenu"
                class="block px-4 py-3 text-gray-700 hover:text-textColor hover:bg-gray-100 rounded-lg text-base font-medium transition-colors"
              >
                申請維修
              </router-link>
              <router-link
                to="/my-orders"
                @click="closeMobileMenu"
                class="block px-4 py-3 text-gray-700 hover:text-textColor hover:bg-gray-100 rounded-lg text-base font-medium transition-colors"
              >
                維修紀錄
              </router-link>
            </div>
          </div>
          
          <!-- 登出按鈕 -->
          <div class="px-6 py-4 border-t border-gray-200">
            <Button
              v-if="frontendUserStore.isLoggedIn"
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

    
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useFrontendUserStore } from '@/stores/frontendUser'
import { logoutUser } from '@/services/api'
import { useLiff } from '@/composables/useLiff'
import Button from '@/components/common/Button.vue'

const route = useRoute()
const router = useRouter()
const frontendUserStore = useFrontendUserStore()
const { isLiffAvailable, logoutLiff } = useLiff()

// 手機版選單狀態
const isMobileMenuOpen = ref(false)

// 判斷是否為管理後台路由
const isAdminRoute = computed(() => route.path.startsWith('/admin'))

// 切換手機版選單
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// 關閉手機版選單
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// 登出功能
const handleLogout = async () => {
  try {
    await logoutUser()
  } catch {
    // Ignore logout errors
  } finally {
    frontendUserStore.clearUser()
    if (isLiffAvailable) {
      logoutLiff()
    }
    closeMobileMenu()
    router.push('/')
  }
}
</script>
