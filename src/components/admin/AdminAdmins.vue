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
            <div>
              <h3 class="text-sm font-medium text-gray-900">{{ currentAdmin.displayName }}</h3>
              <p class="text-sm text-gray-500">帳號: {{ currentAdmin.username }}</p>
              <p class="text-sm text-gray-500">最後登入: {{ formatDate(currentAdmin.lastLoginAt) }}</p>
            </div>
            <button
              @click="showPasswordModal = true"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              修改密碼
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 修改密碼 Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
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
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請再次輸入新密碼"
              />
            </div>
            <div class="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                @click="closePasswordModal"
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useToast } from 'vue-toastification'
import { useAdminStore } from '@/stores/admin'
import { changeAdminPassword } from '@/services/api'
import type { Admin } from '@/types/admin'

const toast = useToast()

const adminStore = useAdminStore()
const showPasswordModal = ref(false)
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
  avatarUrl: '',
  role: 'super_admin',
  status: 'active',
  lastLoginAt: adminStore.currentAdmin?.lastLoginAt || new Date().toISOString()
}))

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const closePasswordModal = () => {
  showPasswordModal.value = false
  passwordForm.currentPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
}

const changePassword = async () => {
  if (!passwordForm.currentPassword.trim() ||
      !passwordForm.newPassword.trim() ||
      !passwordForm.confirmPassword.trim()) {
    toast.warning('請填寫所有欄位')
    return
  }

  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    toast.warning('新密碼與確認密碼不一致')
    return
  }

  if (passwordForm.newPassword.length < 6) {
    toast.warning('新密碼長度至少需要6個字元')
    return
  }

  isSubmitting.value = true

  try {
    await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword)
    closePasswordModal()
    toast.success('密碼修改成功！')
  } catch (error: any) {
    const errorMessage = error?.message || '密碼修改失敗，請重試'
    toast.error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>
