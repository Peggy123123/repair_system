<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-textColor">管理者管理</h2>
      <p class="mt-1 text-sm text-gray-600">管理系統管理者帳號</p>
    </div>

    <!-- 管理者列表 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">

      <div v-if="loading" class="px-4 py-8 text-center">
        <p class="text-gray-500">載入中...</p>
      </div>

      <div v-else-if="error" class="px-4 py-8 text-center">
        <p class="text-red-500">{{ error }}</p>
      </div>

      <div v-else-if="admins.length === 0" class="px-4 py-8 text-center">
        <p class="text-gray-500">目前沒有其他管理者</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              姓名
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              帳號
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              最後登入
            </th>
            <th scope="col" class="relative px-6 py-3">
              <span class="sr-only">操作</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="admin in admins"
            :key="admin.id"
            class="hover:bg-gray-50"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ admin.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-textColor">
              {{ admin.displayName }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ admin.username }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ admin.lastLoginAt ? formatDate(admin.lastLoginAt) : '從未登入' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                v-if="admin.id === currentAdmin.id"
                @click="showPasswordModal = true"
                class="text-blue-600 hover:text-blue-900"
              >
                修改密碼
              </button>
              <template v-else>
                <button
                  @click="openEditModal(admin)"
                  class="text-blue-600 hover:text-blue-900 mr-4"
                >
                  編輯
                </button>
                <button
                  @click="confirmDelete(admin)"
                  class="text-red-600 hover:text-red-900"
                >
                  刪除
                </button>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 修改密碼 Modal -->
    <div v-if="showPasswordModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-textColor mb-4">修改密碼</h3>

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

    <!-- 新增/編輯管理者 Modal -->
    <div v-if="showCreateModal || showEditModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-textColor mb-4">
            {{ showCreateModal ? '新增管理者' : '編輯管理者' }}
          </h3>

          <form @submit.prevent="showCreateModal ? createAdmin() : updateAdmin()" class="space-y-4">
            <div>
              <label for="admin-username" class="block text-sm font-medium text-gray-700 mb-1">
                帳號
              </label>
              <input
                id="admin-username"
                v-model="adminForm.username"
                type="text"
                :required="showCreateModal"
                :disabled="showEditModal"
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                placeholder="請輸入帳號"
              />
            </div>
            <div>
              <label for="admin-displayName" class="block text-sm font-medium text-gray-700 mb-1">
                顯示名稱
              </label>
              <input
                id="admin-displayName"
                v-model="adminForm.displayName"
                type="text"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入顯示名稱"
              />
            </div>
            <div v-if="showCreateModal">
              <label for="admin-password" class="block text-sm font-medium text-gray-700 mb-1">
                密碼
              </label>
              <input
                id="admin-password"
                v-model="adminForm.password"
                type="password"
                required
                class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入密碼"
              />
            </div>
            <div v-if="formError" class="text-sm text-red-600">
              {{ formError }}
            </div>
            <div class="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                @click="closeAdminModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmitting ? '處理中...' : (showCreateModal ? '新增' : '更新') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 刪除確認 Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div class="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg leading-6 font-medium text-textColor mb-4">確認刪除</h3>
          <p class="text-sm text-gray-500 mb-4">
            確定要刪除管理者「{{ deletingAdmin?.displayName }}」嗎？此操作無法復原。
          </p>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeDeleteModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              @click="deleteAdmin"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {{ isSubmitting ? '刪除中...' : '確認刪除' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import { useAdminStore } from '@/stores/admin'
import { changeAdminPassword, getAdmins, createAdmin as apiCreateAdmin, updateAdmin as apiUpdateAdmin, deleteAdmin as apiDeleteAdmin } from '@/services/api'
import type { Admin } from '@/types/admin'
import type { ApiAdmin } from '@/types/api'

const toast = useToast()

const adminStore = useAdminStore()
const showPasswordModal = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isSubmitting = ref(false)
const loading = ref(false)
const error = ref('')
const admins = ref<ApiAdmin[]>([])
const editingAdmin = ref<ApiAdmin | null>(null)
const deletingAdmin = ref<ApiAdmin | null>(null)
const formError = ref('')

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const adminForm = reactive({
  username: '',
  displayName: '',
  password: ''
})

// 當前管理者資訊
const currentAdmin = computed<Admin>(() => ({
  id: adminStore.currentAdmin?.id || '',
  username: adminStore.currentAdmin?.username || '',
  displayName: adminStore.currentAdmin?.displayName || '',
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

const loadAdmins = async () => {
  loading.value = true
  error.value = ''
  try {
    admins.value = await getAdmins()
  } catch (e: any) {
    error.value = e?.message || '載入管理者列表失敗'
  } finally {
    loading.value = false
  }
}

const openEditModal = (admin: ApiAdmin) => {
  editingAdmin.value = admin
  adminForm.username = admin.username
  adminForm.displayName = admin.displayName
  adminForm.password = ''
  formError.value = ''
  showEditModal.value = true
}

const closeAdminModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingAdmin.value = null
  adminForm.username = ''
  adminForm.displayName = ''
  adminForm.password = ''
  formError.value = ''
}

const createAdmin = async () => {
  if (!adminForm.username.trim() || !adminForm.displayName.trim() || !adminForm.password.trim()) {
    formError.value = '請填寫所有欄位'
    return
  }

  if (adminForm.password.length < 6) {
    formError.value = '密碼長度至少需要6個字元'
    return
  }

  isSubmitting.value = true
  formError.value = ''

  try {
    await apiCreateAdmin({
      username: adminForm.username,
      displayName: adminForm.displayName,
      password: adminForm.password
    })
    closeAdminModal()
    toast.success('管理者新增成功！')
    await loadAdmins()
  } catch (error: any) {
    formError.value = error?.message || '新增管理者失敗，請重試'
  } finally {
    isSubmitting.value = false
  }
}

const updateAdmin = async () => {
  if (!editingAdmin.value) return

  if (!adminForm.displayName.trim()) {
    formError.value = '請填寫顯示名稱'
    return
  }

  isSubmitting.value = true
  formError.value = ''

  try {
    await apiUpdateAdmin(editingAdmin.value.id, {
      displayName: adminForm.displayName
    })
    closeAdminModal()
    toast.success('管理者更新成功！')
    await loadAdmins()
  } catch (error: any) {
    formError.value = error?.message || '更新管理者失敗，請重試'
  } finally {
    isSubmitting.value = false
  }
}

const confirmDelete = (admin: ApiAdmin) => {
  deletingAdmin.value = admin
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingAdmin.value = null
}

const deleteAdmin = async () => {
  if (!deletingAdmin.value) return

  isSubmitting.value = true

  try {
    await apiDeleteAdmin(deletingAdmin.value.id)
    closeDeleteModal()
    toast.success('管理者刪除成功！')
    await loadAdmins()
  } catch (error: any) {
    toast.error(error?.message || '刪除管理者失敗，請重試')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  loadAdmins()
})
</script>
