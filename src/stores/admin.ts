import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Admin } from '@/types/admin'

export const useAdminStore = defineStore('admin', () => {
  const currentAdmin = ref<Admin | null>(null)
  const isLoggedIn = computed(() => currentAdmin.value !== null)

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
