<script setup lang="ts">
import axios from 'axios'
import { useToast } from '@nuxt/ui/composables'
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { saveToken } from '@/lib/sessions'
import type { FormError } from '@nuxt/ui'

const props = defineProps<{
  mode: 'create' | 'edit'
}>()

const emit = defineEmits<{
  success: []
}>()

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  name: props.mode === 'edit' ? (authStore.user?.name ?? '') : '',
  email: props.mode === 'edit' ? (authStore.user?.email ?? '') : '',
  password: '',
  passwordConfirmation: '',
})

const isLoading = ref(false)

function validateForm(): FormError[] {
  const errors: FormError[] = []

  if (!form.name) {
    errors.push({ name: 'name', message: 'El nombre es obligatorio' })
  } else if (form.name.length < 3) {
    errors.push({ name: 'name', message: 'El nombre debe tener al menos 3 caracteres' })
  }

  if (!form.email) {
    errors.push({ name: 'email', message: 'El correo electrónico es obligatorio' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.push({ name: 'email', message: 'Ingresa un correo electrónico válido' })
  }

  if (props.mode === 'create' || form.password) {
    if (!form.password) {
      errors.push({ name: 'password', message: 'La contraseña es obligatoria' })
    } else if (form.password.length < 8) {
      errors.push({ name: 'password', message: 'La contraseña debe tener al menos 8 caracteres' })
    }

    if (!form.passwordConfirmation) {
      errors.push({ name: 'passwordConfirmation', message: 'Confirma tu contraseña' })
    } else if (form.passwordConfirmation !== form.password) {
      errors.push({ name: 'passwordConfirmation', message: 'Las contraseñas no coinciden' })
    }
  }

  return errors
}

async function onSubmit() {
  isLoading.value = true

  try {
    if (props.mode === 'create') {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, form, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      })

      authStore.setToken(response.data.token)
      saveToken(response.data.token)

      const meResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${response.data.token}` },
      })

      if (meResponse.data) authStore.setUser(meResponse.data)
    } else {
      const payload: Record<string, string> = {
        user_id: String(authStore.user?.id ?? ''),
        name: form.name,
        email: form.email,
      }
      if (form.password) {
        payload.password = form.password
        payload.passwordConfirmation = form.passwordConfirmation
      }

      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/users`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
      })

      if (response.data) {
        const { token, ...userData } = response.data

        if (token) {
          authStore.setToken(token)
          saveToken(token)
        }

        authStore.setUser(userData)
      }
    }

    emit('success')
  } catch (error) {
    toast.add({
      title: 'Error guardar tus datos',
      description: 'Ocurrió un error al intentar guardar tus datos.',
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UForm
    :state="form"
    :validate="validateForm"
    class="w-full flex flex-col gap-y-4"
    @submit="onSubmit"
  >
    <UFormField label="Nombre" name="name" class="flex flex-col gap-y-1">
      <UInput v-model="form.name" type="text" placeholder="Tu nombre" class="w-full" />
    </UFormField>

    <UFormField label="Correo electrónico" name="email" class="flex flex-col gap-y-1">
      <UInput v-model="form.email" type="email" placeholder="correo@ejemplo.com" class="w-full" />
    </UFormField>

    <UFormField
      :label="mode === 'edit' ? 'Nueva contraseña (opcional)' : 'Contraseña'"
      name="password"
      class="flex flex-col gap-y-1"
    >
      <UInput v-model="form.password" type="password" placeholder="••••••••" class="w-full" />
    </UFormField>

    <UFormField
      label="Confirmar contraseña"
      name="passwordConfirmation"
      class="flex flex-col gap-y-1"
    >
      <UInput
        v-model="form.passwordConfirmation"
        type="password"
        placeholder="••••••••"
        class="w-full"
      />
    </UFormField>

    <UButton type="submit" class="w-fit" block :loading="isLoading">
      {{ mode === 'create' ? 'Registrarse' : 'Guardar cambios' }}
    </UButton>
  </UForm>
</template>
