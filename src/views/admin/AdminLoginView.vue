<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
          <font-awesome-icon icon="shield-alt" class="h-6 w-6 text-red-600" />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          管理後台登入
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          請使用管理員帳號登入
        </p>
      </div>
      
      <form @submit.prevent="handleAdminLogin" class="mt-8 space-y-6">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="admin-username" class="sr-only">管理員帳號</label>
            <input
              id="admin-username"
              v-model="adminForm.username"
              type="text"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="管理員帳號"
            />
          </div>
          <div>
            <label for="admin-password" class="sr-only">密碼</label>
            <input
              id="admin-password"
              v-model="adminForm.password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
              placeholder="密碼"
            />
          </div>
        </div>

        <div v-if="loginError" class="text-red-600 text-sm text-center">
          {{ loginError }}
        </div>

        <div>
          <Button
            type="submit"
            :disabled="isLoading"
            :loading="isLoading"
            :loading-text="'登入中...'"
            text="管理員登入"
            variant="primary"
            size="md"
            :full-width="true"
          />
        </div>

        <div class="text-center">
          <router-link
            to="/" 
            class="text-sm text-gray-600 hover:text-gray-500"
          >
            返回前台登入
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import type { Admin } from '@/types/admin'
import Button from '@/components/common/Button.vue'

const router = useRouter()
const adminStore = useAdminStore()

// 管理員登入表單
const adminForm = ref({
  username: '',
  password: ''
})
const isLoading = ref(false)
const loginError = ref('')

// 管理員登入處理
const handleAdminLogin = async () => {
  isLoading.value = true
  loginError.value = ''
  
  try {
    // 模擬 API 呼叫延遲
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 管理員驗證邏輯
    if (adminForm.value.username === 'admin' && adminForm.value.password === 'admin') {
      const adminUser: Admin = {
        id: 'admin1',
        username: 'admin',
        displayName: '系統管理員',
        avatarUrl: 'https://via.placeholder.com/100x100',
        role: 'super_admin',
        status: 'active',
        lastLoginAt: new Date().toISOString()
      }
      
      adminStore.login(adminUser)
      router.push('/admin')
    } else {
      loginError.value = '管理員帳號或密碼錯誤'
    }
  } catch (error) {
    loginError.value = '登入失敗，請稍後再試'
  } finally {
    isLoading.value = false
  }
}
</script>
