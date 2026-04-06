<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from '@nuxt/ui/composables'
import ViewWrapper from '@/components/ViewWrapper.vue'
import UserDataForm from '@/components/users/UserDataForm.vue'

const router = useRouter()
const toast = useToast()

function onSuccess() {
  toast.add({
    title: 'Perfil actualizado',
    description: 'Tus datos han sido guardados correctamente.',
    color: 'success',
  })

  router.push({ name: 'product-catalog' })
}
</script>

<template>
  <ViewWrapper>
    <div class="size-full flex items-center justify-center">
      <UCard class="w-md">
        <div class="flex flex-col items-start gap-y-4 w-full">
          <div class="flex flex-col items-start gap-y-2 w-full">
            <h1 class="text-xl font-semibold">Editar perfil</h1>
            <p>Actualiza los datos de tu cuenta.</p>
          </div>

          <UserDataForm mode="edit" @success="onSuccess" />
        </div>
      </UCard>
    </div>
  </ViewWrapper>
</template>
