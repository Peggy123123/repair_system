<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">管理者設定</h2>
      <p class="mt-1 text-sm text-gray-600">管理系統管理者帳號設定</p>
    </div>

    <!-- 管理者資訊 -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">管理者資訊</h3>
        
        <div class="space-y-4">
          <div
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
          >
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <img
                  :src="currentAdmin.avatarUrl || 'https://via.placeholder.com/40x40'"
                  :alt="currentAdmin.displayName"
                  class="h-10 w-10 rounded-full"
                />
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ currentAdmin.displayName }}</h3>
                <p class="text-sm text-gray-500">帳號: {{ currentAdmin.username }}</p>
                <p class="text-sm text-gray-500">最後登入: {{ formatDate(currentAdmin.lastLoginAt) }}</p>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                    :class="getRoleClass(currentAdmin.role)">
                {{ getRoleLabel(currentAdmin.role) }}
              </span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                啟用
              </span>
              <button
                @click="showPasswordForm = !showPasswordForm"
                class="text-blue-600 hover:text-blue-900 text-sm"
              >
                修改密碼
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密碼表單 -->
    <div v-if="showPasswordForm" class="bg-white shadow rounded-lg mt-6">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">修改密碼</h3>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700 mb-1">
              目前密碼
            </label>
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              type="password"
              required
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="請輸入目前密碼"
            />
          </div>
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">
              新密碼
            </label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              required
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="請輸入新密碼"
            />
          </div>
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">
              確認新密碼
            </label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              required
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="請再次輸入新密碼"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showPasswordForm = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isSubmitting ? '修改中...' : '修改密碼' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useAdminStore } from '@/stores/admin'
import type { Admin } from '@/types/admin'

const adminStore = useAdminStore()
const showPasswordForm = ref(false)
const isSubmitting = ref(false)

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 當前管理者資訊（固定為單一管理者）
const currentAdmin = computed<Admin>(() => ({
  id: adminStore.currentAdmin?.id || 'admin1',
  username: 'admin',
  displayName: '系統管理員',
  avatarUrl: 'https://via.placeholder.com/40x40',
  role: 'super_admin',
  status: 'active',
  lastLoginAt: new Date().toISOString()
}))

const getRoleClass = (role: string) => {
  const roleClasses = {
    super_admin: 'bg-purple-100 text-purple-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-green-100 text-green-800'
  }
  return roleClasses[role as keyof typeof roleClasses] || 'bg-gray-100 text-gray-800'
}

const getRoleLabel = (role: string) => {
  const roleLabels = {
    super_admin: '超級管理員',
    admin: '管理員',
    moderator: '協管員'
  }
  return roleLabels[role as keyof typeof roleLabels] || role
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const changePassword = async () => {
  if (!passwordForm.currentPassword.trim() || 
      !passwordForm.newPassword.trim() || 
      !passwordForm.confirmPassword.trim()) {
    alert('請填寫所有欄位')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert('新密碼與確認密碼不一致')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    alert('新密碼長度至少需要6個字元')
    return
  }

  isSubmitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 這裡應該呼叫API驗證目前密碼並更新新密碼
    // 目前只是模擬
    
    // 清空表單
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    showPasswordForm.value = false
    
    alert('密碼修改成功！')
  } catch (error) {
    alert('密碼修改失敗，請重試')
  } finally {
    isSubmitting.value = false
  }
}
</script>
