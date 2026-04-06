import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)

  const userAuthenticated = computed(() => token.value !== null && user.value !== null)

  function setToken(value: string) {
    token.value = value
  }

  function setUser(value: User) {
    user.value = value
  }

  return { token, user, userAuthenticated, setToken, setUser }
})
