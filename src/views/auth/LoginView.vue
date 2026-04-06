<script setup lang="ts">
import axios from 'axios'
import { ref } from 'vue'
import { useToast } from '@nuxt/ui/composables'
import { useAuthStore } from '@/stores/auth'
import ViewWrapper from '@/components/ViewWrapper.vue'
import { saveToken } from '@/lib/sessions'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: {
    email(value: string) {
      if (!value) return 'El correo electrónico es requerido'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Ingresa un correo electrónico válido'
      return true
    },
    password(value: string) {
      if (!value) return 'La contraseña es requerida'
      if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres'
      return true
    },
  },
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const isLoading = ref(false)

const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, values, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: false,
    })

    authStore.setToken(response.data.token)
    saveToken(response.data.token)

    const meResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${response.data.token}` },
    })

    if (meResponse.data) {
      authStore.setUser(meResponse.data)
      router.push('/product-catalog')
    }
  } catch {
    toast.add({
      title: 'Error al iniciar sesión',
      description: 'Credenciales incorrectas. Intenta nuevamente.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <ViewWrapper>
    <div class="size-full flex items-center justify-center">
      <UCard class="w-md">
        <div class="flex flex-col items-start gap-y-4 w-full">
          <div class="flex flex-col items-start gap-y-2 w-full">
            <h1 class="text-xl font-semibold">Iniciar sesión</h1>
            <p>Ingresa tus credenciales para iniciar sesión.</p>
          </div>

          <form class="w-full flex flex-col gap-y-4" @submit.prevent="onSubmit">
            <UFormField
              label="Correo electrónico"
              name="email"
              :error="errors.email"
              class="flex flex-col gap-y-1"
            >
              <UInput
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                placeholder="correo@ejemplo.com"
                class="w-full"
              />
            </UFormField>

            <UFormField
              label="Contraseña"
              name="password"
              :error="errors.password"
              class="flex flex-col gap-y-1"
            >
              <UInput
                v-model="password"
                v-bind="passwordAttrs"
                type="password"
                placeholder="••••••••"
                class="w-full"
              />
            </UFormField>

            <UButton type="submit" class="w-fit" block :loading="isLoading">Entrar</UButton>
          </form>
        </div>
      </UCard>
    </div>
  </ViewWrapper>
</template>
