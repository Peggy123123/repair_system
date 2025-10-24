import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref(false)

  const login = (user: User) => {
    currentUser.value = user
    isLoggedIn.value = true
  }

  const logout = () => {
    currentUser.value = null
    isLoggedIn.value = false
  }

  return {
    currentUser,
    isLoggedIn,
    login,
    logout
  }
})
