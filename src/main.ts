import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ui from '@nuxt/ui/vue-plugin'

import App from './App.vue'
import router from './router'
import { watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/stores/cart'
import { getToken, getCart, saveCart } from '@/lib/sessions'
import axios from 'axios'
import { setupAxiosInterceptors } from '@/lib/axios'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ui)

setupAxiosInterceptors()

const token = getToken()
const cartStore = useCartStore()

if (token) {
  const authStore = useAuthStore()
  authStore.setToken(token)

  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (data) authStore.setUser(data)
  } catch {
    // no authenticated session
  }
}

const savedCart = getCart()

if (savedCart.length > 0) cartStore.items.push(...(savedCart as CartItem[]))

watch(
  () => cartStore.items,
  (items) => saveCart(items),
  { deep: true },
)

app.mount('#app')
