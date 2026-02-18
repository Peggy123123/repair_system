import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Admin } from '@/types/admin'
import { getAuthToken, removeAuthToken } from '@/services/api'

const STORAGE_KEY = 'adminUser'

export const useAdminStore = defineStore('admin', () => {
  // 從 localStorage 讀取初始狀態
  const storedAdmin = localStorage.getItem(STORAGE_KEY)
  const currentAdmin = ref<Admin | null>(storedAdmin ? JSON.parse(storedAdmin) : null)
  const isLoggedIn = computed(() => currentAdmin.value !== null && getAuthToken(true) !== null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // 監聽狀態變化並同步到 localStorage
  watch(currentAdmin, (newAdmin) => {
    if (newAdmin) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAdmin))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, { deep: true })

  const setAdmin = (admin: Admin) => {
    currentAdmin.value = admin
  }

  const clearAdmin = () => {
    currentAdmin.value = null
    removeAuthToken(true)
  }

  return {
    currentAdmin,
    isLoggedIn,
    isLoading,
    error,
    setAdmin,
    clearAdmin
  }
})
