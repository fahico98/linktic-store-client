import axios from 'axios'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { removeToken } from '@/lib/sessions'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

export function setupAxiosInterceptors() {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        const authStore = useAuthStore()
        authStore.token = null
        authStore.user = null
        removeToken()
        router.push({ name: 'login' })
      }
      return Promise.reject(error)
    },
  )
}

export default apiClient
