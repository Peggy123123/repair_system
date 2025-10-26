<template>
  <div>
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">使用者管理</h2>
      <p class="mt-1 text-sm text-gray-600">管理系統使用者</p>
    </div>

    <!-- 搜尋和篩選 -->
    <div class="bg-white shadow rounded-lg mb-6">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
              搜尋使用者
            </label>
            <input
              id="search"
              v-model="searchQuery"
              type="text"
              placeholder="搜尋姓名或ID..."
              class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 使用者列表 -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg leading-6 font-medium text-gray-900">使用者列表</h3>
        </div>

        <div v-if="filteredUsers.length === 0" class="text-center py-8">
          <p class="text-gray-500">沒有找到符合條件的使用者</p>
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            @click="viewUserRequests(user)"
            class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="flex items-center space-x-4">
              <div class="flex-shrink-0">
                <img
                  :src="user.avatarUrl || 'https://via.placeholder.com/40x40'"
                  :alt="user.displayName"
                  class="h-10 w-10 rounded-full"
                />
              </div>
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ user.displayName }}</h3>
                <p class="text-sm text-gray-500">ID: {{ user.id }}</p>
                <p class="text-sm text-gray-500">LINE ID: {{ user.lineUserId || '未綁定' }}</p>
                <p 
                  class="text-sm mt-1"
                  :class="getUserRepairCount(user.id) > 0 ? 'text-primary' : 'text-gray-400'"
                >
                  {{ getUserRepairCount(user.id) > 0 ? `已申請維修：${getUserRepairCount(user.id)}次` : '未申請過維修' }}
                </p>
              </div>
            </div>
            <div class="flex items-center">
              <font-awesome-icon icon="chevron-right" class="h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增使用者表單 -->
    <div v-if="showAddUserForm" class="bg-white shadow rounded-lg mt-6">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">新增使用者</h3>
        
        <form @submit.prevent="addUser" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label for="display-name" class="block text-sm font-medium text-gray-700 mb-1">
                顯示名稱
              </label>
              <input
                id="display-name"
                v-model="newUser.displayName"
                type="text"
                required
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入顯示名稱"
              />
            </div>
            <div>
              <label for="line-user-id" class="block text-sm font-medium text-gray-700 mb-1">
                LINE 使用者 ID
              </label>
              <input
                id="line-user-id"
                v-model="newUser.lineUserId"
                type="text"
                class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="請輸入 LINE 使用者 ID"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="showAddUserForm = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ isSubmitting ? '新增中...' : '新增使用者' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { AdminUser } from '@/types/admin'
import { mockUsers } from '@/mock/users'
import { mockRequests } from '@/mock/repairRequests'

const router = useRouter()

const searchQuery = ref('')
const showAddUserForm = ref(false)
const isSubmitting = ref(false)

const newUser = reactive({
  displayName: '',
  lineUserId: ''
})

const users = ref<AdminUser[]>(mockUsers)

// 計算每個使用者的申請次數
const getUserRepairCount = (userId: string): number => {
  return mockRequests.filter(request => request.userId === userId).length
}

const filteredUsers = computed(() => {
  let filtered = users.value

  // 搜尋篩選
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(u => 
      u.displayName.toLowerCase().includes(query) ||
      u.id.toLowerCase().includes(query)
    )
  }

  return filtered
})

const addUser = async () => {
  if (!newUser.displayName.trim()) return

  isSubmitting.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const user: AdminUser = {
      id: `user${Date.now()}`,
      lineUserId: newUser.lineUserId || null,
      displayName: newUser.displayName.trim(),
      avatarUrl: 'https://via.placeholder.com/40x40',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    }
    
    users.value.unshift(user)
    
    // 清空表單
    newUser.displayName = ''
    newUser.lineUserId = ''
    showAddUserForm.value = false
    
    alert('使用者新增成功！')
  } catch (error) {
    alert('新增失敗，請重試')
  } finally {
    isSubmitting.value = false
  }
}

const viewUserRequests = (user: AdminUser) => {
  // 導航到該使用者的申請表單列表
  router.push(`/admin/users/${user.id}/requests`)
}
</script>
