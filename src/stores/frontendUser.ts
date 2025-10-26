import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/frontend'

export const useFrontendUserStore = defineStore('frontendUser', () => {
  const currentUser = ref<User | null>(null)
  const isLoggedIn = computed(() => currentUser.value !== null)

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

