import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { User } from '@/types/frontend'

const STORAGE_KEY = 'frontendUser'

export const useFrontendUserStore = defineStore('frontendUser', () => {
  // 從 localStorage 讀取初始狀態
  const storedUser = localStorage.getItem(STORAGE_KEY)
  const currentUser = ref<User | null>(storedUser ? JSON.parse(storedUser) : null)
  const isLoggedIn = computed(() => currentUser.value !== null)

  // 監聽狀態變化並同步到 localStorage
  watch(currentUser, (newUser) => {
    if (newUser) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, { deep: true })

  const login = (user: User) => {
    currentUser.value = user
  }

  const logout = () => {
    currentUser.value = null
  }

  return {
    currentUser,
    isLoggedIn,
    login,
    logout
  }
})

