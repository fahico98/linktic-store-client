<script setup lang="ts">
import ViewWrapper from '../components/ViewWrapper.vue'
</script>

<template>
  <ViewWrapper>
    <div class="size-full flex flex-col items-center justify-center text-center gap-6 py-24">
      <p class="text-sm text-gray-500 dark:text-gray-400 tracking-widest uppercase">
        Bienvenido a Linktic Store
      </p>

      <h1 class="text-5xl font-bold text-gray-900 dark:text-white leading-tight max-w-2xl">
        Todo lo que necesitas,<br />en un solo lugar.
      </h1>

      <p class="text-lg text-gray-500 dark:text-gray-400 max-w-md">
        Descubre nuestra selección de productos con los mejores precios. Rápido, seguro y desde
        donde estés.
      </p>

      <div class="flex items-center gap-3 mt-2">
        <RouterLink to="/register">
          <UButton size="lg" icon="i-lucide-user-plus">Crear cuenta gratis</UButton>
        </RouterLink>
        <RouterLink to="/login">
          <UButton size="lg" variant="outline" icon="i-lucide-store">Ver catálogo</UButton>
        </RouterLink>
      </div>

      <div class="flex items-center gap-8 mt-8 text-sm text-gray-400 dark:text-gray-500">
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-truck" class="w-4 h-4" />
          Envío rápido
        </span>
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-shield-check" class="w-4 h-4" />
          Pago seguro
        </span>
        <span class="flex items-center gap-1.5">
          <UIcon name="i-lucide-refresh-cw" class="w-4 h-4" />
          Devoluciones gratis
        </span>
      </div>
    </div>
  </ViewWrapper>
</template>
