<script setup lang="ts">
import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { removeToken } from '@/lib/sessions'

const authStore = useAuthStore()
const userAuthenticated = computed(() => authStore.userAuthenticated)
const router = useRouter()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

async function logout() {
  await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`)
  authStore.setToken('')
  authStore.setUser(null as any)
  removeToken()
  router.push('/')
}

function toggleColorMode() {
  colorMode.store.value = isDark.value ? 'light' : 'dark'
}

const menuItems = computed(() => [
  [
    {
      label: authStore.user?.name ?? '',
      type: 'label' as const,
      icon: 'i-lucide-user-circle',
    },
  ],
  [
    {
      label: 'Catálogo de productos',
      icon: 'i-lucide-store',
      to: '/product-catalog',
    },
    {
      label: 'Carrito de compras',
      icon: 'i-lucide-shopping-cart',
      to: '/shopping-cart',
    },
    {
      label: 'Mis compras',
      icon: 'i-lucide-receipt',
      to: '/user-purchases',
    },
    {
      label: 'Editar perfil',
      icon: 'i-lucide-user-pen',
      to: '/edit-user',
    },
  ],
  [
    {
      label: isDark.value ? 'Modo claro' : 'Modo oscuro',
      icon: isDark.value ? 'i-lucide-sun' : 'i-lucide-moon',
      onSelect: toggleColorMode,
    },
  ],
  [
    {
      label: 'Cerrar sesión',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: logout,
    },
  ],
])
</script>

<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-center w-full"
  >
    <div class="flex justify-between items-center w-7xl">
      <div class="flex justify-start items-center">
        <RouterLink to="/" class="text-lg font-semibold text-gray-900 dark:text-white">
          Linktic Store
        </RouterLink>
      </div>
      <div class="flex justify-end items-center">
        <div class="flex items-center gap-x-6">
          <template v-if="userAuthenticated">
            <UDropdownMenu :items="menuItems" :content="{ class: 'z-[60]' }">
              <UButton label="Menú" color="neutral" variant="ghost" trailing-icon="i-lucide-menu" />
            </UDropdownMenu>
          </template>
          <template v-else>
            <RouterLink
              to="/register"
              class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              active-class="text-gray-900 dark:text-white font-medium"
            >
              Registrarse
            </RouterLink>
            <RouterLink
              to="/login"
              class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              active-class="text-gray-900 dark:text-white font-medium"
            >
              Ingresar
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>
