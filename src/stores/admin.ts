import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { Admin } from '@/types/admin'

const STORAGE_KEY = 'adminUser'

export const useAdminStore = defineStore('admin', () => {
  // 從 localStorage 讀取初始狀態
  const storedAdmin = localStorage.getItem(STORAGE_KEY)
  const currentAdmin = ref<Admin | null>(storedAdmin ? JSON.parse(storedAdmin) : null)
  const isLoggedIn = computed(() => currentAdmin.value !== null)

  // 監聯狀態變化並同步到 localStorage
  watch(currentAdmin, (newAdmin) => {
    if (newAdmin) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newAdmin))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, { deep: true })

  const login = (admin: Admin) => {
    currentAdmin.value = admin
  }

  const logout = () => {
    currentAdmin.value = null
  }

  return {
    currentAdmin,
    isLoggedIn,
    login,
    logout
  }
})
