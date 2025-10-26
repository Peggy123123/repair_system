<template>
  <div class="min-h-[calc(100vh-90px)] flex items-center justify-center bg-primary px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white px-8 py-4 rounded-xl">
      <div>
        <h2 class="text-center text-2xl font-extrabold text-primary">
          鈦客星電腦診所
        </h2>
        <p class="mt-2 text-center text-sm text-gray-400">
          請登入以開始使用
        </p>
      </div>
      
      <div class="mt-8 space-y-6">
        <!-- 帳號密碼登入表單 -->
        <form @submit.prevent="handleFormLogin" class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">
              帳號
            </label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="請輸入帳號"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密碼
            </label>
            <input
              id="password"
              v-model="loginForm.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="請輸入密碼"
            />
          </div>
          
          <div v-if="loginError" class="text-red-600 text-sm">
            {{ loginError }}
          </div>
          
          <Button
            type="submit"
            :disabled="isLoading"
            :loading="isLoading"
            :loading-text="'登入中...'"
            text="登入"
            variant="primary"
            size="md"
            :full-width="true"
          />
        </form>
        
        <!-- 分隔線 -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">或</span>
          </div>
        </div>
        
        <!-- LINE 登入按鈕 -->
        <div class="text-center">
          <Button
            @click="handleLineLogin"
            text="使用 LINE 登入"
            :icon="['fab', 'line']"
            variant="primary"
            size="md"
            :full-width="true"
            custom-class="!bg-green-600 !hover:bg-green-700 !focus:ring-green-500"
          />
        </div>
        
        <div class="text-center">
          <p class="text-xs text-gray-500">
            登入即表示您同意我們的服務條款
          </p>
          <div class="mt-2">
            <router-link 
              to="/admin/login" 
              class="text-xs text-gray-400 hover:text-gray-600"
            >
              管理員登入
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFrontendUserStore } from '@/stores/frontendUser'
import Button from '@/components/common/Button.vue'
import { mockLoginUsers } from '@/mock/users'

const router = useRouter()
const frontendUserStore = useFrontendUserStore()

// 表單登入狀態
const loginForm = ref({
  username: '',
  password: ''
})
const isLoading = ref(false)
const loginError = ref('')

// 帳號密碼登入
const handleFormLogin = async () => {
  isLoading.value = true
  loginError.value = ''
  
  try {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 簡單的驗證邏輯（實際應該呼叫後端 API）
    if (loginForm.value.username === 'user' && loginForm.value.password === '123456') {
      frontendUserStore.login(mockLoginUsers[0])
      router.push('/form')
    } else {
      loginError.value = '帳號或密碼錯誤'
    }
  } catch (error) {
    loginError.value = '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}

// LINE 登入
const handleLineLogin = () => {
  // Mock LINE 登入 - 實際會使用 LIFF SDK
  frontendUserStore.login(mockLoginUsers[1])
  router.push('/form')
}
</script>
